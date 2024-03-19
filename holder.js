const https = require('https');

const query = `
{
  EVM(dataset: archive, network: bsc) {
    TokenHolders(
      date: "2024-1-05"
      tokenSmartContract: "0x0e2d3985a69eaeabaacf3845ad2d8f8fc7eb8312"
    ) {
      Holder {
        Address
      }
      Balance {
        Amount
      }
    }
  }
}
`;

const payload = JSON.stringify({
  query,
  variables: {}
});

const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': 'BQYHcZWcorUZRZMRMDiy4VhEeMFZQk9k',
  'Authorization': 'Bearer ory_at_uYM8QFvIJ_3-NFbLrdXLaHFzJl4HtCq8rCNLQDUWBy8.ms6xcYnH3VgbbL3zH6VGE3bg-k_ttlOfzLCN1snNRlM'
};

const options = {
  hostname: 'streaming.bitquery.io',
  path: '/graphql',
  method: 'POST',
  headers: headers
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const parsedData = JSON.parse(data);

    // Extract the count of holders with a minimum of 2 tokens
    const minTokenCount = 2;
    let holderCount = 0;

    if (parsedData.data) {
      for (const [key, value] of Object.entries(parsedData.data)) {
        if (value && value.TokenHolders) {
          const holders = value.TokenHolders;

          if (holders instanceof Array) {
            holderCount = holders.reduce((count, holder) => {
              const amount = parseFloat(holder.Balance?.Amount || 0);
              return count + (amount >= minTokenCount ? 1 : 0);
            }, 0);
          }
        }
      }
    }

    console.log(`Total number of holders with a minimum of ${minTokenCount} tokens: ${holderCount}`);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.write(payload);
req.end();
