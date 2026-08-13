import os
from tavily import TavilyClient

tavily = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def search_web(query):
    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=5
    )

    return response.get("results", [])