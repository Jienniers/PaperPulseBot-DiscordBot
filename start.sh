# Wait a few seconds to ensure MongoDB is ready
echo "Waiting for MongoDB to start..."
sleep 5

# Run scripts before starting the bot
echo "Clearing old slash commands..."
node scripts/clear-slash-commands.js

echo "Registering slash commands..."
node scripts/deploy-slash-commands.js

# Finally start the bot
echo "Starting bot..."
node index.js
