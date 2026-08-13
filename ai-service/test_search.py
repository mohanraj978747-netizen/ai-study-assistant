from search_service import search_web

results = search_web("latest React version")

print("\n===== SEARCH RESULTS =====\n")

for i, result in enumerate(results, 1):
    print(f"{i}. {result.get('title')}")
    print(f"URL: {result.get('url')}")
    print(f"Content: {result.get('content', '')[:500]}")
    print("-" * 60)