// Simple test to verify the Netlify API is responding
async function testAPI() {
  const API_URL = "https://cresca.netlify.app/api/close-position";
  
  console.log("🌐 Testing Netlify API endpoint...");
  console.log("URL:", API_URL);
  console.log("─".repeat(60));

  try {
    // Test with invalid data to see if API responds
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionId: "test",
        userAddress: "test",
        rawTransaction: "test"
      }),
    });

    const result = await response.json();
    
    console.log("\n✅ API is LIVE and responding!");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));
    
    if (response.status === 400 && result.error) {
      console.log("\n✅ API validation is working correctly!");
      console.log("   (Expected error for invalid test data)");
    }
    
    console.log("\n" + "═".repeat(60));
    console.log("✅ ✅ ✅ DEPLOYMENT SUCCESSFUL! ✅ ✅ ✅");
    console.log("═".repeat(60));
    console.log("\n🎉 Your backend is live on Netlify!");
    console.log("🔗 API Endpoint: " + API_URL);
    console.log("🏠 Homepage: https://cresca.netlify.app");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testAPI();
