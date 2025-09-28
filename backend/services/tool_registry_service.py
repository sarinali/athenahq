import pickle
from typing import List

from googleapiclient.discovery import build
from langchain_community.agent_toolkits.github.toolkit import GitHubToolkit
from langchain_community.tools.gmail.send_message import GmailSendMessage
from langchain_community.utilities.github import GitHubAPIWrapper
from langchain_core.tools import StructuredTool

import logging

logging.basicConfig(level=logging.INFO)

from config import GITHUB_TOKEN
from config import GITHUB_APP_ID
from config import GITHUB_APP_PRIVATE_KEY


class ToolRegistryService:
    def __init__(self) -> None:
        self._creds = None
        self._gmail_service = None
        self._docs_service = None
        self._drive_service = None
        self._tools = None

    def _load_creds(self, creds_path: str = "token.pickle"):
        with open(creds_path, "rb") as f:
            self._creds = pickle.load(f)

    def _build_services(self):
        if not self._creds:
            self._load_creds()

        self._gmail_service = build("gmail", "v1", credentials=self._creds)
        self._docs_service = build("docs", "v1", credentials=self._creds)
        self._drive_service = build("drive", "v3", credentials=self._creds)

    def _create_doc(self, title: str, content: str):
        doc = self._docs_service.documents().create(body={"title": title}).execute()
        doc_id = doc["documentId"]

        requests = [{"insertText": {"location": {"index": 1}, "text": content}}]
        self._docs_service.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()

        drive_meta = self._drive_service.files().get(fileId=doc_id, fields="webViewLink").execute()
        return f"Created doc: {title}\nLink: {drive_meta['webViewLink']}"

    def _read_doc(self, doc_id: str):
        doc = self._docs_service.documents().get(documentId=doc_id).execute()
        content = []
        for element in doc.get("body", {}).get("content", []):
            if "paragraph" in element:
                for elem in element["paragraph"]["elements"]:
                    if "textRun" in elem:
                        content.append(elem["textRun"]["content"])
        return "".join(content).strip()

    def _search_docs_by_title(self, title: str):
        query = f"name contains '{title}' and mimeType='application/vnd.google-apps.document'"
        results = self._drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])

        if not files:
            return f"No Google Docs found with title containing '{title}'"

        # Return the first match
        doc = files[0]
        return f"Found document: {doc['name']} (ID: {doc['id']})"

    def _read_doc_by_title(self, title: str):
        query = f"name contains '{title}' and mimeType='application/vnd.google-apps.document'"
        results = self._drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])

        if not files:
            return f"No Google Docs found with title containing '{title}'"

        doc_id = files[0]["id"]
        doc_name = files[0]["name"]
        content = self._read_doc(doc_id)
        return f"Content of '{doc_name}':\n\n{content}"

    def _make_docs_tools(self):
        return [
            StructuredTool.from_function(
                func=lambda title, content: self._create_doc(title, content),
                name="create_google_doc",
                description="Create a new Google Doc with a given title and content",
            ),
            StructuredTool.from_function(
                func=lambda doc_id: self._read_doc(doc_id),
                name="read_google_doc_by_id",
                description="Read the text content of a Google Doc by its documentId",
            ),
            StructuredTool.from_function(
                func=lambda title: self._read_doc_by_title(title),
                name="read_google_doc_by_title",
                description="Read the text content of a Google Doc by searching for its title",
            ),
            StructuredTool.from_function(
                func=lambda title: self._search_docs_by_title(title),
                name="search_google_docs",
                description="Search for Google Docs by title and get their IDs",
            ),
        ]

    def _make_github_tools(self):
        logging.info(f"GITHUB_TOKEN present: {bool(GITHUB_TOKEN)}")
        if not GITHUB_TOKEN:
            logging.info("No GITHUB_TOKEN found, skipping GitHub tools")
            return []

        try:
            logging.info("Creating GitHub API wrapper...")
            github = GitHubAPIWrapper(
                github_repository="sarinali/athenahq"
            )
            toolkit = GitHubToolkit.from_github_api_wrapper(github)
            tools = toolkit.get_tools()
            logging.info(f"GitHub tools loaded: {[tool.name for tool in tools]}")
            return tools
        except Exception as e:
            logging.error(f"Failed to load GitHub tools: {e}")
            return []

    def get_tools(self) -> List:
        if self._tools is None:
            self._build_services()

            gmail_tool = GmailSendMessage(api_resource=self._gmail_service)
            docs_tools = self._make_docs_tools()
            github_tools = self._make_github_tools()

            # Sanitize GitHub tool names for OpenAI compatibility
            import re
            for tool in github_tools:
                # Replace spaces with underscores, remove special characters, convert to lowercase
                sanitized_name = re.sub(r'[^a-zA-Z0-9_-]', '_', tool.name.replace(' ', '_')).lower()
                # Remove multiple consecutive underscores
                sanitized_name = re.sub(r'_+', '_', sanitized_name).strip('_')
                tool.name = sanitized_name
                logging.info(f"Sanitized tool name: {tool.name}")

            self._tools = [gmail_tool] + docs_tools + github_tools

        return self._tools


service = ToolRegistryService()