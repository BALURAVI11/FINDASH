const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/sync') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const db = {
                transactions: data.transactions || [],
                budgetDb: { id: "root", budgets: data.budgets || {} }
            };
            fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
            console.log("✅ Successfully written local storage data to db.json!");
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.end();
        }
    });
  }
});

server.listen(5005, () => console.log('Sync server listening on port 5005. Ready to extract browser localStorage...'));
