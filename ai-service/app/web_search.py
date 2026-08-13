import os

from tavily import TavilyClient


def get_tavily_client():
    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        raise RuntimeError(
            "TAVILY_API_KEY is not configured"
        )

    return TavilyClient(api_key=api_key)


def search_web(query: str):
    """
    Search the web using Tavily.
    Returns a list of search results.
    """

    client = get_tavily_client()

    response = client.search(
        query=query,
        search_depth="basic",
        max_results=5,
    )

    return response.get("results", [])