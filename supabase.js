const SUPABASE_CONFIG = {
  url: "https://fzrrtdhmrbuwsnwzjkoq.supabase.co",
  publishableKey: "sb_publishable_wAgPILCmdEwUwcKMRpohkA_ZFL7I0TM"
};

async function supabaseFetch(path) {
  const response = await fetch(
    SUPABASE_CONFIG.url + path,
    {
      headers: {
        apikey: SUPABASE_CONFIG.publishableKey,
        Authorization: "Bearer " + SUPABASE_CONFIG.publishableKey
      }
    }
  );

  if (!response.ok) {
    throw new Error("Supabase request failed: " + response.status);
  }

  return response.json();
}

async function loadSupabaseStore() {
  const settings = await supabaseFetch(
    "/rest/v1/store_settings?select=*&id=eq.true&limit=1"
  );

  const products = await supabaseFetch(
    "/rest/v1/products?select=id&is_active=eq.true&limit=1000"
  );

  return {
    settings: settings[0] || null,
    productCount: products.length
  };
}