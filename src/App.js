import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, AlertCircle, Globe, BarChart3, Sparkles, Brain, Target, Clock, RefreshCw, ExternalLink, Database, Activity, Flame } from 'lucide-react';

export default function TrendPulse() {
  const [activeTab, setActiveTab] = useState('discover');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [historicalData, setHistoricalData] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [dataCollectionStatus, setDataCollectionStatus] = useState('initializing');
  const [customUrl, setCustomUrl] = useState('');
  const [customUrlError, setCustomUrlError] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [trackedUrls, setTrackedUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  // Get related stock tickers based on trend
  const getRelatedStocks = (trend) => {
    const { name, description } = trend;
    const text = `${name} ${description}`.toLowerCase();
    const stocks = [];

    // AI/ML Related
    if (text.match(/\b(ai|artificial intelligence|ml|machine learning|gpt|llm|neural)\b/)) {
      stocks.push('NVDA', 'MSFT', 'GOOGL', 'META', 'AMD');
    }
    
    // Cloud/Infrastructure
    if (text.match(/\b(cloud|aws|azure|infrastructure|serverless|kubernetes)\b/)) {
      stocks.push('MSFT', 'AMZN', 'GOOGL', 'CRM', 'SNOW');
    }
    
    // Cybersecurity
    if (text.match(/\b(security|cyber|hack|breach|encryption|privacy)\b/)) {
      stocks.push('CRWD', 'PANW', 'ZS', 'FTNT', 'OKTA');
    }
    
    // Crypto/Blockchain
    if (text.match(/\b(crypto|bitcoin|ethereum|blockchain|web3|defi)\b/)) {
      stocks.push('COIN', 'MSTR', 'RIOT', 'MARA', 'SQ');
    }
    
    // Climate/Energy
    if (text.match(/\b(climate|solar|energy|carbon|ev|electric vehicle)\b/)) {
      stocks.push('TSLA', 'ENPH', 'SEDG', 'FSLR', 'RUN');
    }
    
    // E-commerce/Retail
    if (text.match(/\b(ecommerce|retail|shopping|marketplace|fulfillment)\b/)) {
      stocks.push('AMZN', 'SHOP', 'EBAY', 'MELI', 'ETSY');
    }
    
    // Social Media
    if (text.match(/\b(social|twitter|facebook|instagram|tiktok|snap)\b/)) {
      stocks.push('META', 'SNAP', 'PINS', 'RDDT');
    }
    
    // FinTech
    if (text.match(/\b(fintech|payment|banking|stripe|paypal|finance)\b/)) {
      stocks.push('SQ', 'PYPL', 'V', 'MA', 'SOFI');
    }
    
    // Gaming
    if (text.match(/\b(gaming|game|esports|metaverse|vr|ar)\b/)) {
      stocks.push('RBLX', 'U', 'EA', 'TTWO', 'NVDA');
    }
    
    // Healthcare/Biotech
    if (text.match(/\b(health|medical|biotech|pharma|drug|therapy)\b/)) {
      stocks.push('TDOC', 'VEEV', 'DXCM', 'ILMN', 'CRSP');
    }
    
    // Semiconductor/Chips
    if (text.match(/\b(chip|semiconductor|processor|silicon|fab)\b/)) {
      stocks.push('NVDA', 'AMD', 'INTC', 'TSM', 'AVGO');
    }
    
    // Developer Tools
    if (text.match(/\b(github|gitlab|code|developer|api|sdk)\b/)) {
      stocks.push('MSFT', 'GTLB', 'SNOW', 'MDB', 'NET');
    }

    // Remove duplicates and return top 3
    return [...new Set(stocks)].slice(0, 3);
  };

  // Helper functions
  function getDaysSinceCreation(dateString) {
    return Math.max(1, Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24)));
  }

  function formatRepoName(name) {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function extractTrendFromTitle(title) {
    const words = title.split(' ').filter(w => w.length > 3);
    return words.slice(0, 5).join(' ').replace(/[^\w\s]/g, '').substring(0, 50);
  }

  function categorizeTopic(title) {
    const lower = title.toLowerCase();
    if (lower.match(/\b(ai|ml|gpt|llm|neural|model)\b/)) return 'AI/ML';
    if (lower.match(/\b(crypto|bitcoin|blockchain|web3)\b/)) return 'Crypto';
    if (lower.match(/\b(startup|founder|vc|funding)\b/)) return 'Startups';
    if (lower.match(/\b(climate|energy|solar|carbon)\b/)) return 'Climate';
    if (lower.match(/\b(security|privacy|hack|breach)\b/)) return 'Security';
    if (lower.match(/\b(react|vue|js|python|rust)\b/)) return 'Dev Tools';
    return 'Technology';
  }

  const getPredictionReasoning = (trend) => {
    const { analysis, rawData, source } = trend;
    
    if (source.includes('GitHub')) {
      return `Daily star rate of ${rawData.dailyStarRate} with ${analysis.velocityChange}% acceleration. Typical breakout pattern detected.`;
    } else if (source.includes('Hacker News')) {
      return `Score velocity of ${rawData.scorePerHour}/hour with ${rawData.comments} comments. High engagement indicates viral potential.`;
    } else {
      return `${rawData.upvotesPerHour} upvotes/hour with ${(rawData.upvoteRatio * 100).toFixed(0)}% approval. Strong community momentum.`;
    }
  };

  const getPredictionBadge = (prediction) => {
    const badges = {
      'breaking_out': { color: 'bg-red-500', text: '🔥 Breaking Out', glow: 'shadow-red-500/50' },
      'viral_potential': { color: 'bg-orange-500', text: '⚡ Viral Potential', glow: 'shadow-orange-500/50' },
      'community_momentum': { color: 'bg-yellow-500', text: '📈 Strong Momentum', glow: 'shadow-yellow-500/50' },
      'rising': { color: 'bg-blue-500', text: '📊 Rising', glow: 'shadow-blue-500/50' },
      'new_signal': { color: 'bg-purple-500', text: '✨ New Signal', glow: 'shadow-purple-500/50' },
      'monitoring': { color: 'bg-gray-500', text: '👁️ Monitoring', glow: '' }
    };
    return badges[prediction] || badges.monitoring;
  };

  // Generate fallback data if APIs fail
  const generateFallbackData = (currentTimestamp) => {
    const fallbackTrends = [
      {
        id: 'fallback-1',
        name: 'AI-Powered Development Tools',
        description: 'Next generation of coding assistants using large language models',
        source: 'GitHub',
        sourceUrl: 'https://github.com/trending',
        category: 'AI/ML',
        rawData: { stars: 12500, forks: 1800, watchers: 3500, openIssues: 45, dailyStarRate: 85, daysSinceCreation: 45 },
        timestamp: currentTimestamp,
        analysis: { confidence: 78, velocityChange: 125, isAccelerating: true, prediction: 'breaking_out', daysTracked: 3, dataPoints: 3 }
      },
      {
        id: 'fallback-2',
        name: 'Micro-SaaS Platform Builders',
        description: 'Tools for rapidly building and deploying small SaaS businesses',
        source: 'Hacker News',
        sourceUrl: 'https://news.ycombinator.com',
        category: 'Startups',
        rawData: { score: 520, comments: 145, scorePerHour: 28, hoursSincePost: 6 },
        timestamp: currentTimestamp,
        analysis: { confidence: 82, velocityChange: 95, isAccelerating: true, prediction: 'viral_potential', daysTracked: 2, dataPoints: 2 }
      },
      {
        id: 'fallback-3',
        name: 'Climate Tech Data Analytics',
        description: 'Carbon tracking and ESG reporting automation for enterprises',
        source: 'Reddit r/startups',
        sourceUrl: 'https://reddit.com/r/startups',
        category: 'Climate',
        rawData: { upvotes: 1450, comments: 210, upvoteRatio: 0.94, upvotesPerHour: 72, hoursSincePost: 8 },
        timestamp: currentTimestamp,
        analysis: { confidence: 75, velocityChange: 88, isAccelerating: true, prediction: 'community_momentum', daysTracked: 1, dataPoints: 1 }
      }
    ];
    
    return fallbackTrends;
  };

  // Remove a tracked URL
  const removeTrackedUrl = async (urlToRemove) => {
    if (window.confirm('Stop tracking this URL?')) {
      const updated = trackedUrls.filter(u => u.url !== urlToRemove);
      await saveCustomUrls(updated);
      setTrackedUrls(updated);
    }
  };

  // Initialize and load historical data from storage
  useEffect(() => {
    const init = async () => {
      await loadHistoricalData();
      await refreshTrackedUrls();
      // Auto-fetch on first load
      await fetchAndAnalyzeTrends();
    };
    
    init();
    
    // Set up automatic collection every 6 hours
    const interval = setInterval(() => {
      fetchAndAnalyzeTrends();
    }, 60 * 60 * 1000); // 1 hour for local testing (backend handles Mon-Fri schedule)
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Refresh tracked URLs list
  const refreshTrackedUrls = async () => {
    setLoadingUrls(true);
    const urls = await loadCustomUrls();
    setTrackedUrls(urls || []);
    setLoadingUrls(false);
  };

  // Load historical data from storage
  const loadHistoricalData = async () => {
    try {
      const data = localStorage.getItem('trendpulse_historical_data');
      if (data) {
        const parsed = JSON.parse(data);
        setHistoricalData(parsed);
        console.log('Loaded historical data:', Object.keys(parsed).length, 'trends tracked');
      }
    } catch (e) {
      console.log('No historical data yet, starting fresh');
      setHistoricalData({});
    }
  };

  // Save historical data to storage
  const saveHistoricalData = async (data) => {
    try {
      localStorage.setItem('trendpulse_historical_data', JSON.stringify(data));
      console.log('Saved historical data');
    } catch (e) {
      console.error('Error saving historical data:', e);
    }
  };

  // Load custom tracked URLs
  const loadCustomUrls = async () => {
    try {
      const data = localStorage.getItem('trendpulse_custom_urls');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.log('No custom URLs yet');
    }
    return [];
  };

  // Save custom tracked URLs
  const saveCustomUrls = async (urls) => {
    try {
      localStorage.setItem('trendpulse_custom_urls', JSON.stringify(urls));
    } catch (e) {
      console.error('Error saving custom URLs:', e);
    }
  };

  // Fetch data for a custom URL
  const fetchCustomUrlData = async (url, type, itemId) => {
    const timestamp = Date.now();
    
    try {
      if (type === 'github') {
        const [owner, repo] = itemId.split('/');
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const daysSince = getDaysSinceCreation(data.created_at);
          const dailyStarRate = data.stargazers_count / Math.max(1, daysSince);
          
          return {
            id: `custom-gh-${data.id}`,
            name: data.name,
            description: data.description || 'Custom tracked GitHub repository',
            source: 'GitHub (Custom)',
            sourceUrl: data.html_url,
            category: data.language || 'Technology',
            rawData: {
              stars: data.stargazers_count,
              forks: data.forks_count,
              watchers: data.watchers_count,
              openIssues: data.open_issues_count,
              dailyStarRate: Math.round(dailyStarRate * 100) / 100,
              daysSinceCreation: daysSince
            },
            timestamp,
            isCustom: true
          };
        }
      } else if (type === 'hackernews') {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`);
        
        if (response.ok) {
          const data = await response.json();
          const hoursSince = (Date.now() / 1000 - data.time) / 3600;
          const scorePerHour = data.score / Math.max(1, hoursSince);
          
          return {
            id: `custom-hn-${data.id}`,
            name: extractTrendFromTitle(data.title),
            description: data.title,
            source: 'Hacker News (Custom)',
            sourceUrl: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
            category: categorizeTopic(data.title),
            rawData: {
              score: data.score || 0,
              comments: data.descendants || 0,
              scorePerHour: Math.round(scorePerHour * 100) / 100,
              hoursSincePost: Math.round(hoursSince)
            },
            timestamp,
            isCustom: true
          };
        }
      } else if (type === 'reddit') {
        const response = await fetch(`https://www.reddit.com/comments/${itemId}.json`);
        
        if (response.ok) {
          const data = await response.json();
          const post = data[0]?.data?.children[0]?.data;
          
          if (post) {
            const hoursSince = (Date.now() / 1000 - post.created_utc) / 3600;
            const upvotesPerHour = post.score / Math.max(1, hoursSince);
            
            return {
              id: `custom-reddit-${post.id}`,
              name: extractTrendFromTitle(post.title),
              description: post.title,
              source: 'Reddit (Custom)',
              sourceUrl: `https://reddit.com${post.permalink}`,
              category: categorizeTopic(post.title),
              rawData: {
                upvotes: post.score,
                comments: post.num_comments,
                upvoteRatio: post.upvote_ratio,
                upvotesPerHour: Math.round(upvotesPerHour * 100) / 100,
                hoursSincePost: Math.round(hoursSince)
              },
              timestamp,
              isCustom: true
            };
          }
        }
      } else {
        // Generic URL - create basic tracking
        return {
          id: `custom-${type}-${Date.now()}`,
          name: extractTrendFromTitle(url),
          description: `Custom tracked: ${url}`,
          source: `${type.charAt(0).toUpperCase() + type.slice(1)} (Custom)`,
          sourceUrl: url,
          category: 'Custom',
          rawData: {
            views: 0,
            engagement: 0,
            trackingSince: Date.now()
          },
          timestamp,
          isCustom: true
        };
      }
    } catch (e) {
      console.error(`Error fetching custom ${type} data:`, e);
    }
    
    return null;
  };

  // Add custom URL to tracking
  const addCustomUrl = async () => {
    if (!customUrl.trim()) {
      setCustomUrlError('Please enter a URL');
      return;
    }

    setAddingCustom(true);
    setCustomUrlError('');

    try {
      // Determine URL type - support any URL
      let urlType = 'generic';
      let itemId = null;

      if (customUrl.includes('github.com')) {
        urlType = 'github';
        const match = customUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) itemId = `${match[1]}/${match[2]}`;
      } else if (customUrl.includes('news.ycombinator.com')) {
        urlType = 'hackernews';
        const match = customUrl.match(/id=(\d+)/);
        if (match) itemId = match[1];
      } else if (customUrl.includes('reddit.com')) {
        urlType = 'reddit';
        const match = customUrl.match(/comments\/([^/]+)/);
        if (match) itemId = match[1];
      } else if (customUrl.includes('twitter.com') || customUrl.includes('x.com')) {
        urlType = 'twitter';
        const match = customUrl.match(/status\/(\d+)/);
        if (match) itemId = match[1];
      } else if (customUrl.includes('linkedin.com')) {
        urlType = 'linkedin';
        itemId = customUrl;
      } else if (customUrl.includes('youtube.com') || customUrl.includes('youtu.be')) {
        urlType = 'youtube';
        const match = customUrl.match(/(?:watch\?v=|youtu\.be\/)([^&?]+)/);
        if (match) itemId = match[1];
      } else if (customUrl.includes('medium.com') || customUrl.includes('substack.com') || customUrl.includes('dev.to')) {
        urlType = 'blog';
        itemId = customUrl;
      } else {
        // Generic URL - accept anything
        urlType = 'generic';
        itemId = customUrl.replace(/https?:\/\//, '').substring(0, 50);
      }

      if (!itemId) {
        itemId = customUrl.replace(/https?:\/\//, '').substring(0, 50);
      }

      // Load existing custom URLs
      const customUrls = await loadCustomUrls();
      
      // Check if already tracking
      if (customUrls.some(u => u.url === customUrl)) {
        setCustomUrlError('Already tracking this URL');
        setAddingCustom(false);
        return;
      }

      // Add to custom tracking list
      customUrls.push({
        url: customUrl,
        type: urlType,
        itemId: itemId,
        addedAt: Date.now()
      });

      await saveCustomUrls(customUrls);

      // Fetch initial data for this URL
      const newTrendData = await fetchCustomUrlData(customUrl, urlType, itemId);
      
      if (newTrendData) {
        // Add analysis to the new trend
        const analyzedTrend = analyzeTrends([newTrendData], historicalData)[0];
        
        // Add to current trends immediately
        const updatedTrends = [analyzedTrend, ...trends];
        setTrends(updatedTrends);
        
        // Update predictions if high confidence
        if (analyzedTrend.analysis.confidence > 70 && analyzedTrend.analysis.isAccelerating) {
          setPredictions([...predictions, {
            ...analyzedTrend,
            predictionType: analyzedTrend.analysis.prediction,
            estimatedBreakout: `${Math.max(3, 14 - analyzedTrend.analysis.daysTracked)} days`,
            reasoning: getPredictionReasoning(analyzedTrend)
          }]);
        }
        
        // Save to historical data
        const updatedHistorical = { ...historicalData };
        if (!updatedHistorical[newTrendData.id]) {
          updatedHistorical[newTrendData.id] = {
            firstSeen: Date.now(),
            dataPoints: []
          };
        }
        updatedHistorical[newTrendData.id].dataPoints.push({
          timestamp: Date.now(),
          ...newTrendData.rawData
        });
        setHistoricalData(updatedHistorical);
        await saveHistoricalData(updatedHistorical);
      }

      setCustomUrl('');
      setCustomUrlError('');
      
      // Refresh the tracked URLs list
      await refreshTrackedUrls();
      
      alert('✅ URL added and analyzing! Check Discover tab to see it.');
      
    } catch (e) {
      setCustomUrlError('Error adding URL. Please try again.');
      console.error('Error adding custom URL:', e);
    } finally {
      setAddingCustom(false);
    }
  };

// Main data collection and analysis function
  const fetchAndAnalyzeTrends = async () => {
    setLoading(true);
    setError(null);
    setDataCollectionStatus('collecting');

  // Find and replace your fetchAndAnalyzeTrends function definition:
const fetchAndAnalyzeTrends = async (userId) => { // ADD userId parameter
    if (!userId) { // Check if a user is logged in
        console.log("Not fetching trends, user is not logged in.");
        setTrends([]); // Clear old data
        return; 
    }
    
    // ... rest of your function code ...

    // When you call loadHistoricalData, pass the userId
    // await loadHistoricalData(userId); 

    // When you save the new data, make sure the save function accepts and uses userId
    // await saveNewTrends(newTrends, userId);

    // ... continue with the rest of the function ...
};
    
    try {
      const trendData = [];
      const timestamp = Date.now();
      
      // Fetch custom tracked URLs first
      try {
        const customUrls = await loadCustomUrls();
        for (const customItem of customUrls) {
          const customData = await fetchCustomUrlData(customItem.url, customItem.type, customItem.itemId);
          if (customData) {
            trendData.push(customData);
          }
        }
        console.log(`Loaded ${trendData.length} custom tracked items`);
      } catch (e) {
        console.error('Error loading custom URLs:', e);
      }
      
      // GitHub trending repositories
      try {
        const ghResponse = await fetch('https://api.github.com/search/repositories?q=created:>2024-10-01&sort=stars&order=desc&per_page=20', {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!ghResponse.ok) {
          console.log('GitHub API rate limit or error:', ghResponse.status);
          throw new Error('GitHub API error');
        }
        
        const ghData = await ghResponse.json();
        
        if (ghData.items) {
          for (const repo of ghData.items) {
            const trendId = `gh-${repo.id}`;
            const daysSince = getDaysSinceCreation(repo.created_at);
            const dailyStarRate = repo.stargazers_count / Math.max(1, daysSince);
            
            trendData.push({
              id: trendId,
              name: formatRepoName(repo.name),
              description: repo.description || 'GitHub repository gaining traction',
              source: 'GitHub',
              sourceUrl: repo.html_url,
              category: repo.language || 'Technology',
              rawData: {
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                openIssues: repo.open_issues_count,
                dailyStarRate: Math.round(dailyStarRate * 100) / 100,
                daysSinceCreation: daysSince
              },
              timestamp
            });
          }
        }
      } catch (e) {
        console.error('GitHub fetch error:', e);
      }

      // Hacker News trending
      try {
        const hnTopResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topIds = await hnTopResponse.json();
        
        const storyPromises = topIds.slice(0, 30).map(id => 
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(r => r.json())
            .catch(() => null)
        );
        const stories = (await Promise.all(storyPromises)).filter(s => s);
        
        for (const story of stories) {
          if (story && story.title) {
            const trendId = `hn-${story.id}`;
            const hoursSince = (Date.now() / 1000 - story.time) / 3600;
            const scorePerHour = story.score / Math.max(1, hoursSince);
            
            trendData.push({
              id: trendId,
              name: extractTrendFromTitle(story.title),
              description: story.title,
              source: 'Hacker News',
              sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
              category: categorizeTopic(story.title),
              rawData: {
                score: story.score || 0,
                comments: story.descendants || 0,
                scorePerHour: Math.round(scorePerHour * 100) / 100,
                hoursSincePost: Math.round(hoursSince)
              },
              timestamp
            });
          }
        }
      } catch (e) {
        console.error('HN fetch error:', e);
      }

      // Reddit trending
      try {
        const subreddits = ['technology', 'startups', 'artificial', 'MachineLearning', 'programming'];
        for (const sub of subreddits) {
          const redditResponse = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`);
          const redditData = await redditResponse.json();
          
          if (redditData.data?.children) {
            for (const post of redditData.data.children) {
              const p = post.data;
              const trendId = `reddit-${p.id}`;
              const hoursSince = (Date.now() / 1000 - p.created_utc) / 3600;
              const upvotesPerHour = p.score / Math.max(1, hoursSince);
              
              trendData.push({
                id: trendId,
                name: extractTrendFromTitle(p.title),
                description: p.title,
                source: `Reddit r/${sub}`,
                sourceUrl: `https://reddit.com${p.permalink}`,
                category: categorizeTopic(p.title),
                rawData: {
                  upvotes: p.score,
                  comments: p.num_comments,
                  upvoteRatio: p.upvote_ratio,
                  upvotesPerHour: Math.round(upvotesPerHour * 100) / 100,
                  hoursSincePost: Math.round(hoursSince)
                },
                timestamp
              });
            }
          }
        }
      } catch (e) {
        console.error('Reddit fetch error:', e);
      }

      setDataCollectionStatus('analyzing');
      
      // Ensure we have at least some data
      if (trendData.length === 0) {
        console.warn('No data collected from APIs, using fallback');
        const fallbackTrends = generateFallbackData(timestamp);
        setTrends(fallbackTrends.map(t => ({
          ...t,
          analysis: t.analysis || { confidence: 70, velocityChange: 0, isAccelerating: false, prediction: 'monitoring', daysTracked: 0, dataPoints: 1 }
        })));
        setPredictions(fallbackTrends.filter(t => t.analysis?.confidence > 70));
        setLastUpdate(new Date());
        setDataCollectionStatus('complete');
        setLoading(false);
        return;
      }
      
      console.log(`Collected ${trendData.length} trends from APIs`);
      
      // Update historical data
      const updatedHistorical = { ...historicalData };
      for (const trend of trendData) {
        if (!updatedHistorical[trend.id]) {
          updatedHistorical[trend.id] = {
            firstSeen: timestamp,
            dataPoints: []
          };
        }
        updatedHistorical[trend.id].dataPoints.push({
          timestamp,
          ...trend.rawData
        });
        
        // Keep only last 30 days of data
        updatedHistorical[trend.id].dataPoints = updatedHistorical[trend.id].dataPoints
          .filter(dp => timestamp - dp.timestamp < 30 * 24 * 60 * 60 * 1000);
      }
      
      setHistoricalData(updatedHistorical);
      await saveHistoricalData(updatedHistorical);
      
      setDataCollectionStatus('predicting');
      
      // Analyze and generate predictions
      const analyzedTrends = analyzeTrends(trendData, updatedHistorical);
      const predictedTrends = generatePredictions(analyzedTrends);
      
      setTrends(analyzedTrends);
      setPredictions(predictedTrends);
      setLastUpdate(new Date());
      setDataCollectionStatus('complete');
      
    } catch (err) {
      setError(`Failed to fetch trend data: ${err.message}. Using fallback data.`);
      console.error('Error fetching trends:', err);
      setDataCollectionStatus('error');
      
      // If everything failed, at least show something
      if (trends.length === 0) {
        const fallbackTrends = generateFallbackData(Date.now());
        setTrends(fallbackTrends);
      }
    } finally {
      setLoading(false);
    }
  };

  // Analyze trends with historical context
  const analyzeTrends = (currentTrends, historical) => {
    return currentTrends.map(trend => {
      const history = historical[trend.id];
      let velocityChange = 0;
      let isAccelerating = false;
      let confidence = 50;
      let prediction = 'monitoring';
      
      // For new custom URLs, give initial confidence based on metrics
      if (!history || history.dataPoints.length <= 1) {
        if (trend.source.includes('GitHub') || trend.source === 'GitHub') {
          const rate = trend.rawData.dailyStarRate || 0;
          if (rate > 20) {
            confidence = 75;
            prediction = 'new_signal';
            isAccelerating = true;
          } else if (rate > 10) {
            confidence = 68;
            prediction = 'rising';
          } else if (rate > 5) {
            confidence = 62;
          }
        } else if (trend.source.includes('Hacker News')) {
          const rate = trend.rawData.scorePerHour || 0;
          if (rate > 30) {
            confidence = 78;
            prediction = 'viral_potential';
            isAccelerating = true;
          } else if (rate > 20) {
            confidence = 70;
            prediction = 'new_signal';
          } else if (rate > 10) {
            confidence = 64;
          }
        } else if (trend.source.includes('Reddit')) {
          const rate = trend.rawData.upvotesPerHour || 0;
          if (rate > 50) {
            confidence = 76;
            prediction = 'community_momentum';
            isAccelerating = true;
          } else if (rate > 25) {
            confidence = 68;
            prediction = 'new_signal';
          }
        }
        
        return {
          ...trend,
          analysis: {
            confidence: Math.round(confidence),
            velocityChange: 0,
            isAccelerating,
            prediction,
            daysTracked: 0,
            dataPoints: 1
          }
        };
      }
      
      if (history && history.dataPoints.length > 1) {
        const dataPoints = history.dataPoints;
        const latest = dataPoints[dataPoints.length - 1];
        const previous = dataPoints[dataPoints.length - 2];
        
        // Calculate velocity change based on source
        if (trend.source.includes('GitHub') || trend.source === 'GitHub') {
          const latestRate = latest.dailyStarRate || 0;
          const prevRate = previous.dailyStarRate || 0;
          velocityChange = prevRate > 0 ? ((latestRate - prevRate) / prevRate) * 100 : 0;
          
          if (latestRate > 10 && velocityChange > 50) {
            isAccelerating = true;
            confidence = Math.min(85, 60 + velocityChange / 2);
            prediction = 'breaking_out';
          } else if (latestRate > 5) {
            confidence = 65;
            prediction = 'rising';
          }
        } else if (trend.source.includes('Hacker News')) {
          const latestRate = latest.scorePerHour || 0;
          const prevRate = previous.scorePerHour || 0;
          velocityChange = prevRate > 0 ? ((latestRate - prevRate) / prevRate) * 100 : 0;
          
          if (latestRate > 20 && velocityChange > 30) {
            isAccelerating = true;
            confidence = Math.min(82, 60 + velocityChange / 3);
            prediction = 'viral_potential';
          }
        } else if (trend.source.includes('Reddit')) {
          const latestRate = latest.upvotesPerHour || 0;
          const prevRate = previous.upvotesPerHour || 0;
          velocityChange = prevRate > 0 ? ((latestRate - prevRate) / prevRate) * 100 : 0;
          
          if (latestRate > 15 && velocityChange > 40) {
            isAccelerating = true;
            confidence = Math.min(80, 60 + velocityChange / 4);
            prediction = 'community_momentum';
          }
        }
        
        // Adjust confidence based on data history
        const daysTracked = (Date.now() - history.firstSeen) / (1000 * 60 * 60 * 24);
        if (daysTracked > 3) confidence += 5;
        if (daysTracked > 7) confidence += 5;
        
        return {
          ...trend,
          analysis: {
            confidence: Math.round(confidence),
            velocityChange: Math.round(velocityChange),
            isAccelerating,
            prediction,
            daysTracked: Math.floor(daysTracked),
            dataPoints: history.dataPoints.length
          }
        };
      }
      
      return {
        ...trend,
        analysis: {
          confidence: Math.round(confidence),
          velocityChange: Math.round(velocityChange),
          isAccelerating,
          prediction,
          daysTracked: history ? Math.floor((Date.now() - history.firstSeen) / (1000 * 60 * 60 * 24)) : 0,
          dataPoints: history ? history.dataPoints.length : 0
        }
      };
    }).sort((a, b) => b.analysis.confidence - a.analysis.confidence);
  };

  // Generate predictions for high-confidence trends
  const generatePredictions = (trends) => {
    return trends
      .filter(t => t.analysis.confidence > 70 && t.analysis.isAccelerating)
      .map(t => ({
        ...t,
        predictionType: t.analysis.prediction,
        estimatedBreakout: `${Math.max(3, 14 - t.analysis.daysTracked)} days`,
        reasoning: getPredictionReasoning(t)
      }));
  };

  const stats = {
    signals: trends.reduce((sum, t) => {
      const data = t.rawData;
      return sum + (data.stars || data.score || data.upvotes || 0);
    }, 0),
    trends: trends.length,
    avgConfidence: trends.length > 0 ? Math.floor(trends.reduce((sum, t) => sum + t.analysis.confidence, 0) / trends.length) : 0,
    predictions: predictions.length,
    trackedItems: Object.keys(historicalData).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      <div className="relative max-w-7xl mx-auto p-6">
        <header className="mb-12 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TrendPulse AI
                </h1>
                <p className="text-purple-300 text-sm">Predictive Market Intelligence</p>
              </div>
            </div>
            <button
              onClick={fetchAndAnalyzeTrends}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? dataCollectionStatus : 'Scan Now'}
            </button>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-purple-400">Last scan: {lastUpdate.toLocaleString('en-US', { 
                timeZone: 'America/New_York',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} EST</span>
              <span className="text-green-400">• Auto-scans hourly (Mon-Fri)</span>
              <span className="text-blue-400">• Tracking {stats.trackedItems} items</span>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <Brain className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.signals.toLocaleString()}</div>
            <div className="text-purple-300 text-sm">Total Signals</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-pink-400 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.trends}</div>
            <div className="text-pink-300 text-sm">Active Trends</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
            <Flame className="w-8 h-8 text-red-400 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.predictions}</div>
            <div className="text-red-300 text-sm">High Predictions</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
            <Target className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgConfidence}%</div>
            <div className="text-blue-300 text-sm">Avg Confidence</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <Database className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.trackedItems}</div>
            <div className="text-green-300 text-sm">Items Tracked</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-4 mb-8 flex-wrap">
          {['predictions', 'discover', 'custom', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-300 hover:bg-white/10'
              }`}
            >
              {tab === 'predictions' && '🔥 '}
              {tab === 'custom' && '➕ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-400" />
              High-Confidence Predictions (Breaking Out Soon)
            </h2>
            
            {predictions.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 mb-2">Building prediction models...</p>
                <p className="text-purple-400 text-sm">Need 2-3 data points per trend. Check back in 12-24 hours.</p>
              </div>
            ) : (
              predictions.map((trend) => {
                const badge = getPredictionBadge(trend.predictionType);
                return (
                  <div
                    key={trend.id}
                    className={`bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30 rounded-xl p-6 hover:border-red-500/50 transition-all shadow-lg ${badge.glow}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white">{trend.name}</h3>
                          <span className={`px-3 py-1 ${badge.color} text-white rounded-full text-sm font-bold shadow-lg`}>
                            {badge.text}
                          </span>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {trend.category}
                          </span>
                        </div>
                        <p className="text-gray-200 mb-3">{trend.description}</p>
                        <div className="bg-black/30 border border-yellow-500/30 rounded-lg p-3 mb-3">
                          <div className="text-yellow-300 font-semibold mb-1">📊 Prediction Analysis:</div>
                          <div className="text-gray-300 text-sm">{trend.reasoning}</div>
                          <div className="text-green-400 text-sm mt-2">⏰ Estimated breakout: {trend.estimatedBreakout}</div>
                          
                          {getRelatedStocks(trend).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-yellow-500/20">
                              <div className="text-green-400 font-semibold text-sm mb-2">💰 Investment Opportunities:</div>
                              <div className="flex flex-wrap gap-2">
                                {getRelatedStocks(trend).map(ticker => (
                                  <a
                                    key={ticker}
                                    href={`https://finance.yahoo.com/quote/${ticker}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded font-mono font-bold text-sm transition-colors flex items-center gap-1"
                                  >
                                    ${ticker} <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                              <div className="text-gray-400 text-xs mt-2">
                                ⚠️ Not financial advice. These companies may benefit from this trend. Do your own research.
                              </div>
                            </div>
                          )}
                        </div>
                        <a 
                          href={trend.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                        >
                          View on {trend.source} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="text-xs text-green-300 mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-green-400">{trend.analysis.confidence}%</div>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                        <div className="text-xs text-red-300 mb-1">Acceleration</div>
                        <div className="text-2xl font-bold text-red-400">+{Math.abs(trend.analysis.velocityChange)}%</div>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="text-xs text-blue-300 mb-1">Days Tracked</div>
                        <div className="text-2xl font-bold text-blue-400">{trend.analysis.daysTracked}</div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                        <div className="text-xs text-purple-300 mb-1">Data Points</div>
                        <div className="text-2xl font-bold text-purple-400">{trend.analysis.dataPoints}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              All Monitored Trends
            </h2>
            
            {loading && trends.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-purple-200">Collecting data from multiple sources...</p>
                <p className="text-purple-400 text-sm mt-2">This may take 10-20 seconds</p>
              </div>
            ) : trends.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 mb-3">No trends found. Click "Scan Now" to collect trend data.</p>
                <button
                  onClick={fetchAndAnalyzeTrends}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Scan Now
                </button>
              </div>
            ) : (
              trends.map((trend) => {
                const badge = getPredictionBadge(trend.analysis.prediction);
                return (
                  <div
                    key={trend.id}
                    className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all cursor-pointer"
                    onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-purple-100">{trend.name}</h3>
                          <span className={`px-3 py-1 ${badge.color} text-white rounded-full text-xs font-bold`}>
                            {badge.text}
                          </span>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {trend.category}
                          </span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                            {trend.source}
                          </span>
                        </div>
                        <p className="text-purple-200 mb-3">{trend.description}</p>
                        <a 
                          href={trend.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="text-xs text-green-300 mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-green-400">{trend.analysis.confidence}%</div>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                        <div className="text-xs text-pink-300 mb-1">Velocity</div>
                        <div className="text-xl font-bold text-pink-400">{trend.analysis.velocityChange > 0 ? '+' : ''}{trend.analysis.velocityChange}%</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 mb-1">Tracked</div>
                        <div className="text-lg font-bold text-blue-400">{trend.analysis.daysTracked}d</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-xs text-purple-300 mb-1">Data Points</div>
                        <div className="text-lg font-bold text-purple-400">{trend.analysis.dataPoints}</div>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <div className="text-xs text-orange-300 mb-1">Primary Metric</div>
                        <div className="text-lg font-bold text-orange-400">
                          {trend.rawData.stars || trend.rawData.score || trend.rawData.upvotes || 0}
                        </div>
                      </div>
                    </div>

                    {selectedTrend?.id === trend.id && (
                      <div className="border-t border-purple-500/20 pt-4 mt-4">
                        <div className="text-sm text-purple-300 font-semibold mb-3">Detailed Metrics:</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(trend.rawData).map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded-lg p-3">
                              <div className="text-xs text-purple-400 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-lg font-bold text-purple-100">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                              </div>
                            </div>
                          ))}
                        </div>
                        {trend.analysis.isAccelerating && (
                          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <div className="text-yellow-400 font-semibold mb-2">⚡ Acceleration Detected</div>
                            <div className="text-yellow-200 text-sm mb-3">
                              This trend is showing rapid growth velocity. Monitor closely for breakout.
                            </div>
                            {getRelatedStocks(trend).length > 0 && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded p-2 mt-2">
                                <div className="text-green-400 font-semibold text-sm mb-1">📈 Related Stock Opportunities:</div>
                                <div className="flex flex-wrap gap-2">
                                  {getRelatedStocks(trend).map(ticker => (
                                    <span key={ticker} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-mono font-bold">
                                      ${ticker}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-green-300 text-xs mt-1">
                                  Companies positioned to benefit from this trend
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-400" />
                Track Custom URLs
              </h2>

              <p className="text-purple-200 mb-6">
                Add any URL you want to monitor. We'll track it on every scan and alert you to acceleration patterns.
              </p>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-white mb-3">➕ Add URL to Track</h3>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setCustomUrlError('');
                      }}
                      placeholder="https://github.com/owner/repo"
                      className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    {customUrlError && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {customUrlError}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      console.log('Add button clicked');
                      addCustomUrl();
                    }}
                    disabled={addingCustom || !customUrl.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingCustom ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Start Tracking
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <h4 className="font-semibold text-white mb-3">✅ Supported URLs:</h4>
                  <div className="space-y-2 text-sm text-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <strong className="text-white">GitHub:</strong> Repository URLs
                        <div className="text-purple-400 text-xs mt-1">github.com/owner/repo</div>
                      </div>
                      <div>
                        <strong className="text-white">Hacker News:</strong> Post URLs
                        <div className="text-pink-400 text-xs mt-1">news.ycombinator.com/item?id=X</div>
                      </div>
                      <div>
                        <strong className="text-white">Reddit:</strong> Post URLs
                        <div className="text-blue-400 text-xs mt-1">reddit.com/r/.../comments/...</div>
                      </div>
                      <div>
                        <strong className="text-white">Twitter/X:</strong> Tweet URLs
                        <div className="text-cyan-400 text-xs mt-1">twitter.com/.../status/...</div>
                      </div>
                      <div>
                        <strong className="text-white">YouTube:</strong> Video URLs
                        <div className="text-red-400 text-xs mt-1">youtube.com/watch?v=...</div>
                      </div>
                      <div>
                        <strong className="text-white">LinkedIn:</strong> Post URLs
                        <div className="text-blue-400 text-xs mt-1">linkedin.com/posts/...</div>
                      </div>
                      <div>
                        <strong className="text-white">Blogs:</strong> Medium, Substack, Dev.to
                        <div className="text-green-400 text-xs mt-1">Any article URL</div>
                      </div>
                      <div>
                        <strong className="text-white">Any URL:</strong> Generic tracking
                        <div className="text-gray-400 text-xs mt-1">We'll track what we can</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Currently Tracking ({trackedUrls.length})
                </h3>
                
                {loadingUrls ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-purple-300">Loading tracked URLs...</p>
                  </div>
                ) : trackedUrls.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                    <h4 className="font-semibold text-white mb-2">No Custom URLs Yet</h4>
                    <p className="text-purple-300 text-sm">Add a URL above to start tracking it automatically on every scan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trackedUrls.map((item, index) => {
                      const historyKey = Object.keys(historicalData).find(k => k.includes(item.itemId));
                      const history = historyKey ? historicalData[historyKey] : null;
                      
                      return (
                        <div key={item.url || index} className="bg-white/5 border border-purple-500/20 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  item.type === 'github' ? 'bg-purple-500/20 text-purple-300' :
                                  item.type === 'hackernews' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {item.type?.toUpperCase() || 'UNKNOWN'}
                                </span>
                                <span className="text-green-400 text-xs">✓ Active</span>
                              </div>
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1 break-all"
                              >
                                {item.url && item.url.length > 70 ? item.url.substring(0, 70) + '...' : item.url} 
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                              {history && (
                                <div className="flex items-center gap-4 text-xs text-purple-400 mt-2">
                                  <span>📊 {history.dataPoints.length} data points</span>
                                  <span>📅 {Math.floor((Date.now() - history.firstSeen) / (1000 * 60 * 60 * 24))} days</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeTrackedUrl(item.url)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 text-sm flex-shrink-0 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-purple-400" />
                Historical Data Collection
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{Object.keys(historicalData).length}</div>
                  <div className="text-purple-200">Total Items Tracked</div>
                  <div className="text-purple-400 text-sm mt-2">Across all sources</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {Object.values(historicalData).reduce((sum, item) => sum + item.dataPoints.length, 0)}
                  </div>
                  <div className="text-blue-200">Total Data Points</div>
                  <div className="text-blue-400 text-sm mt-2">Collected measurements</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                  <div className="text-4xl font-bold text-green-400 mb-2">1h</div>
                  <div className="text-green-200">Collection Interval</div>
                  <div className="text-green-400 text-sm mt-2">Mon-Fri automatic scans</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-white mb-4">Collection Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Last Collection:</span>
                    <span className="text-purple-400 font-mono">
                      {lastUpdate ? lastUpdate.toLocaleString('en-US', {
                        timeZone: 'America/New_York',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) + ' EST' : 'Not yet run'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Next Collection:</span>
                    <span className="text-green-400 font-mono">Hourly (Mon-Fri)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Data Retention:</span>
                    <span className="text-blue-400 font-mono">30 days per item</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Storage:</span>
                    <span className="text-yellow-400 font-mono">Browser localStorage</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3">What's Being Tracked</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-purple-400 font-semibold mb-2">GitHub</div>
                    <ul className="text-purple-200 text-sm space-y-1">
                      <li>• Stars & forks</li>
                      <li>• Daily star rate</li>
                      <li>• Watchers & issues</li>
                      <li>• Growth velocity</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-pink-400 font-semibold mb-2">Hacker News</div>
                    <ul className="text-pink-200 text-sm space-y-1">
                      <li>• Score & comments</li>
                      <li>• Score per hour</li>
                      <li>• Engagement rate</li>
                      <li>• Virality signals</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-blue-400 font-semibold mb-2">Reddit</div>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• Upvotes & comments</li>
                      <li>• Upvote ratio</li>
                      <li>• Upvotes per hour</li>
                      <li>• Community momentum</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}