import pickle
from googleapiclient.discovery import build
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.tools.gmail.send_message import GmailSendMessage
from langchain_core.tools import StructuredTool
from config import OPENAI_KEY

# --- Load creds from token.pickle ---
def load_creds(creds_path="token.pickle"):
    with open(creds_path, "rb") as f:
        creds = pickle.load(f)
    return creds

# --- Build Google API services ---
def build_gmail_service(creds):
    return build("gmail", "v1", credentials=creds)

def build_docs_service(creds):
    return build("docs", "v1", credentials=creds)

def build_drive_service(creds):
    return build("drive", "v3", credentials=creds)

# --- Docs helper functions ---
def create_doc(title: str, content: str, docs_service, drive_service):
    doc = docs_service.documents().create(body={"title": title}).execute()
    doc_id = doc["documentId"]

    requests = [{"insertText": {"location": {"index": 1}, "text": content}}]
    docs_service.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()

    drive_meta = drive_service.files().get(fileId=doc_id, fields="webViewLink").execute()
    return f"Created doc: {title}\nLink: {drive_meta['webViewLink']}"

def read_doc(doc_id: str, docs_service):
    doc = docs_service.documents().get(documentId=doc_id).execute()
    content = []
    for element in doc.get("body", {}).get("content", []):
        if "paragraph" in element:
            for elem in element["paragraph"]["elements"]:
                if "textRun" in elem:
                    content.append(elem["textRun"]["content"])
    return "".join(content).strip()

def make_docs_tools(docs_service, drive_service):
    return [
        StructuredTool.from_function(
            func=lambda title, content: create_doc(title, content, docs_service, drive_service),
            name="create_google_doc",
            description="Create a new Google Doc with a given title and content",
        ),
        StructuredTool.from_function(
            func=lambda doc_id: read_doc(doc_id, docs_service),
            name="read_google_doc",
            description="Read the text content of a Google Doc by its documentId",
        ),
    ]

# --- Main ---
if __name__ == "__main__":
    creds = load_creds("token.pickle")

    # Services
    gmail_service = build_gmail_service(creds)
    docs_service = build_docs_service(creds)
    drive_service = build_drive_service(creds)

    # Tools
    gmail_tool = GmailSendMessage(api_resource=gmail_service)
    docs_tools = make_docs_tools(docs_service, drive_service)
    tools = [gmail_tool] + docs_tools

    # LLM
    llm = ChatOpenAI(model="gpt-4.1", temperature=0, api_key=OPENAI_KEY)

    # Agent
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that can create and read Google Docs."),
        MessagesPlaceholder("chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools)

    # --- Run test flows ---
    print("🤖 Reading from the Exchange Master Doc...")
    doc_id = "1f10EtMeBWNbI8OBo4k2t46WmqJGBJjl6HW5U1dn1fyo"
    doc_content = read_doc(doc_id, docs_service)
    print("\n📄 Exchange Master Doc Content:\n")
    print(doc_content[:2000])  # print first 2000 chars

    print("\n🤖 Creating a new doc...")
    new_doc_result = create_doc("Athena POC Doc", "This is a test created via LangChain + token.pickle.", docs_service, drive_service)
    print(new_doc_result)

    print("\n🤖 Sending an email...")
    response = agent_executor.invoke({
        "input": "Send an email to ryanjin333@gmail.com with subject 'Docs POC' and body 'We just created a doc and read Exchange Master Doc.'"
    })
    print("\n📧 Gmail Result:", response.get("output"))
