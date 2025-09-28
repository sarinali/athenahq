import pickle
import requests
from typing import List, Dict, Any

from googleapiclient.discovery import build
import logging

logging.basicConfig(level=logging.INFO)

from config import GITHUB_TOKEN


class ToolRegistryService:
    def __init__(self) -> None:
        self._creds = None
        self._gmail_service = None
        self._docs_service = None
        self._drive_service = None

    def _load_creds(self, creds_path: str = "token.pickle"):
        with open(creds_path, "rb") as f:
            self._creds = pickle.load(f)

    def _build_services(self):
        if not self._creds:
            self._load_creds()

        self._gmail_service = build("gmail", "v1", credentials=self._creds)
        self._docs_service = build("docs", "v1", credentials=self._creds)
        self._drive_service = build("drive", "v3", credentials=self._creds)

    def send_gmail(self, to: str, subject: str, message: str) -> str:
        """Send an email via Gmail"""
        import base64
        from email.mime.text import MIMEText

        if not self._gmail_service:
            self._build_services()

        msg = MIMEText(message)
        msg['to'] = to
        msg['subject'] = subject

        raw = base64.urlsafe_b64encode(msg.as_bytes())
        raw = raw.decode()

        try:
            message = self._gmail_service.users().messages().send(
                userId="me", body={'raw': raw}
            ).execute()
            return f"Email sent successfully. Message ID: {message['id']}"
        except Exception as e:
            return f"Failed to send email: {str(e)}"

    def create_google_doc(self, title: str, content: str) -> str:
        """Create a new Google Doc with a given title and content"""
        if not self._docs_service:
            self._build_services()

        doc = self._docs_service.documents().create(body={"title": title}).execute()
        doc_id = doc["documentId"]

        requests = [{"insertText": {"location": {"index": 1}, "text": content}}]
        self._docs_service.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()

        drive_meta = self._drive_service.files().get(fileId=doc_id, fields="webViewLink").execute()
        return f"Created doc: {title}\nLink: {drive_meta['webViewLink']}"

    def read_google_doc_by_id(self, doc_id: str) -> str:
        """Read the text content of a Google Doc by its documentId"""
        if not self._docs_service:
            self._build_services()

        doc = self._docs_service.documents().get(documentId=doc_id).execute()
        content = []
        for element in doc.get("body", {}).get("content", []):
            if "paragraph" in element:
                for elem in element["paragraph"]["elements"]:
                    if "textRun" in elem:
                        content.append(elem["textRun"]["content"])
        return "".join(content).strip()

    def search_google_docs(self, title: str) -> str:
        """Search for Google Docs by title and get their IDs"""
        if not self._drive_service:
            self._build_services()

        query = f"name contains '{title}' and mimeType='application/vnd.google-apps.document'"
        results = self._drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])

        if not files:
            return f"No Google Docs found with title containing '{title}'"

        # Return the first match
        doc = files[0]
        return f"Found document: {doc['name']} (ID: {doc['id']})"

    def read_google_doc_by_title(self, title: str) -> str:
        """Read the text content of a Google Doc by searching for its title"""
        if not self._drive_service:
            self._build_services()

        query = f"name contains '{title}' and mimeType='application/vnd.google-apps.document'"
        results = self._drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])

        if not files:
            return f"No Google Docs found with title containing '{title}'"

        doc_id = files[0]["id"]
        doc_name = files[0]["name"]
        content = self.read_google_doc_by_id(doc_id)
        return f"Content of '{doc_name}':\n\n{content}"

    def create_github_issue(self, title: str, body: str, repo: str = "sarinali/athenahq") -> str:
        """Create a GitHub issue"""
        if not GITHUB_TOKEN:
            return "GitHub token not configured"

        url = f"https://api.github.com/repos/{repo}/issues"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        data = {"title": title, "body": body}

        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 201:
                issue = response.json()
                return f"Created issue #{issue['number']}: {issue['title']}\nURL: {issue['html_url']}"
            else:
                return f"Failed to create issue: {response.status_code} - {response.text}"
        except Exception as e:
            return f"Error creating GitHub issue: {str(e)}"

    def get_github_issues(self, repo: str = "sarinali/athenahq", state: str = "open") -> str:
        """Get GitHub issues for a repository"""
        if not GITHUB_TOKEN:
            return "GitHub token not configured"

        url = f"https://api.github.com/repos/{repo}/issues"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {"state": state}

        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                issues = response.json()
                if not issues:
                    return f"No {state} issues found in {repo}"

                result = f"{state.title()} issues in {repo}:\n"
                for issue in issues[:10]:
                    result += f"#{issue['number']}: {issue['title']}\n"
                return result
            else:
                return f"Failed to get issues: {response.status_code} - {response.text}"
        except Exception as e:
            return f"Error getting GitHub issues: {str(e)}"

    def get_tool_schemas(self) -> List[Dict[str, Any]]:
        """Return OpenAI-compatible tool schemas"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "send_email",
                    "description": "Send an email via Gmail",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "to": {"type": "string", "description": "Email recipient"},
                            "subject": {"type": "string", "description": "Email subject"},
                            "message": {"type": "string", "description": "Email message content"}
                        },
                        "required": ["to", "subject", "message"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_google_doc",
                    "description": "Create a new Google Doc with a given title and content",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Document title"},
                            "content": {"type": "string", "description": "Document content"}
                        },
                        "required": ["title", "content"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "read_google_doc_by_id",
                    "description": "Read the text content of a Google Doc by its documentId",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "doc_id": {"type": "string", "description": "Google Doc document ID"}
                        },
                        "required": ["doc_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "read_google_doc_by_title",
                    "description": "Read the text content of a Google Doc by searching for its title",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Document title to search for"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_google_docs",
                    "description": "Search for Google Docs by title and get their IDs",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Document title to search for"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_github_issue",
                    "description": "Create a GitHub issue",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Issue title"},
                            "body": {"type": "string", "description": "Issue description"},
                            "repo": {"type": "string", "description": "Repository (default: sarinali/athenahq)"}
                        },
                        "required": ["title", "body"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_github_issues",
                    "description": "Get GitHub issues for a repository",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "repo": {"type": "string", "description": "Repository (default: sarinali/athenahq)"},
                            "state": {"type": "string", "enum": ["open", "closed", "all"], "description": "Issue state"}
                        },
                        "required": []
                    }
                }
            }
        ]

    def call_function(self, function_name: str, **kwargs) -> str:
        """Call a function by name with given arguments"""
        function_map = {
            "send_email": self.send_gmail,
            "create_google_doc": self.create_google_doc,
            "read_google_doc_by_id": self.read_google_doc_by_id,
            "read_google_doc_by_title": self.read_google_doc_by_title,
            "search_google_docs": self.search_google_docs,
            "create_github_issue": self.create_github_issue,
            "get_github_issues": self.get_github_issues
        }

        if function_name not in function_map:
            return f"Unknown function: {function_name}"

        try:
            return function_map[function_name](**kwargs)
        except Exception as e:
            return f"Error calling {function_name}: {str(e)}"


service = ToolRegistryService()