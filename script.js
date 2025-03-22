const API_KEY = 'AIzaSyAOJXUmBWC6qBZ57m93tJwNn7IoGqjjmeI'; // Replace with your YouTube Data API v3 key
const channelInput = document.getElementById('channelInput');
const searchButton = document.getElementById('searchButton');
const analyticsGrid = document.getElementById('analyticsGrid');

// Initialize Chart.js charts
const subscriberChart = new Chart(document.getElementById('subscriberChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Subscriber Growth',
      data: [100, 200, 300, 400, 500, 600],
      borderColor: '#00ffcc',
      fill: false,
    }],
  },
});

const videoChart = new Chart(document.getElementById('videoChart'), {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Video Uploads',
      data: [5, 10, 15, 20, 25, 30],
      backgroundColor: '#00ffcc',
    }],
  },
});

// Add more charts similarly...

// Fetch channel data
searchButton.addEventListener('click', async () => {
  const query = channelInput.value.trim();
  if (!query) return alert('Please enter a channel name or URL.');

  try {
    // Step 1: Search for the channel
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    const channelId = searchData.items[0].id.channelId;

    // Step 2: Fetch channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,status,brandingSettings&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    const channel = channelData.items[0];

    // Display analytics
    displayAnalytics(channel);
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Failed to fetch channel data. Please try again.');
  }
});

// Display analytics
function displayAnalytics(channel) {
  const snippet = channel.snippet;
  const stats = channel.statistics;
  const branding = channel.brandingSettings;

  const revenue = calculateRevenue(stats.viewCount, snippet.country);

  analyticsGrid.innerHTML = `
    <div><strong>Channel ID:</strong> ${channel.id}</div>
    <div><strong>Channel Title:</strong> ${snippet.title}</div>
    <div><strong>Description:</strong> ${snippet.description || 'N/A'}</div>
    <div><strong>Custom URL:</strong> ${branding.channel?.customUrl || 'N/A'}</div>
    <div><strong>Subscriber Count:</strong> ${stats.subscriberCount || 'N/A'}</div>
    <div><strong>Video Count:</strong> ${stats.videoCount || 'N/A'}</div>
    <div><strong>View Count:</strong> ${stats.viewCount || 'N/A'}</div>
    <div><strong>Channel Creation Date:</strong> ${snippet.publishedAt || 'N/A'}</div>
    <div><strong>Profile Picture:</strong> <img src="${snippet.thumbnails.high.url}" alt="Profile Picture" width="100"></div>
    <div><strong>Country:</strong> ${snippet.country || 'N/A'}</div>
    <div><strong>Channel Status:</strong> ${channel.status.privacyStatus}</div>
    <div><strong>Related Playlists:</strong> ${channel.contentDetails?.relatedPlaylists?.uploads || 'N/A'}</div>
    <div><strong>Keywords:</strong> ${branding.channel?.keywords || 'N/A'}</div>
    <div class="revenue-block"><strong>Total Revenue:</strong> $${revenue}</div>
  `;
}

// Calculate revenue
function calculateRevenue(views, country) {
  const rpmRates = {
    US: 7.53,
    UK: 5.62,
    NZ: 5.56,
    AE: 2.33,
    PK: 2.5,
    IN: 2.5,
  };
  const rpm = rpmRates[country] || 2.5; // Default RPM
  return ((views / 1000) * rpm).toFixed(2);
}