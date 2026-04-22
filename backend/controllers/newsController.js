// News Controller for election-related articles

exports.getElectionNews = async (req, res) => {
  const { state } = req.query;
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || apiKey === 'your_news_api_key_here') {
    return res.json({ 
      articles: [
        {
          title: "Setup News API Key",
          description: "To see real-time news, please add your GNews.io or NewsAPI.org key to the backend .env file.",
          url: "https://gnews.io/",
          source: { name: "Election Assistant" },
          publishedAt: new Date().toISOString()
        }
      ] 
    });
  }

  try {
    // Default search for Indian elections
    let query = "Election India";
    if (state) {
      query = `Election ${state} India`;
    }

    // NewsData.io search URL pattern (apiKey pub_... matches this service)
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&country=in`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "error") {
      console.error('News API Error:', data.results);
      return res.status(500).json({ error: 'News API error', details: data.results });
    }

    // Map NewsData.io results to the format expected by the frontend
    const mappedArticles = (data.results || []).map(item => ({
      title: item.title,
      description: item.description || item.content?.substring(0, 200) + '...',
      url: item.link,
      image: item.image_url,
      source: { name: item.source_id || 'News' },
      publishedAt: item.pubDate
    }));

    res.json({ articles: mappedArticles });
  } catch (err) {
    console.error('Server Side News Error:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};
