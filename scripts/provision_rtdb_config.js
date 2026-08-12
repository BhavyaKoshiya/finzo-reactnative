/**
 * Administrative provisioning script for Finzo Realtime Database /config node.
 * Validates rtdb_config_payload.json before writing to prevent corrupting remote configuration.
 * Safe, non-destructive to unrelated database paths.
 */
const fs = require('fs');
const path = require('path');

const PAYLOAD_PATH = path.join(__dirname, 'rtdb_config_payload.json');

const loadAndValidatePayload = () => {
  if (!fs.existsSync(PAYLOAD_PATH)) {
    throw new Error(`Payload file not found at: ${PAYLOAD_PATH}`);
  }

  const raw = fs.readFileSync(PAYLOAD_PATH, 'utf8');
  const payload = JSON.parse(raw);

  if (payload.version !== 1) {
    throw new Error(`Invalid payload version: ${payload.version}. Expected version 1.`);
  }

  if (!payload.rewards || !payload.redemption) {
    throw new Error('Payload missing required rewards or redemption nodes.');
  }

  return payload;
};

const provision = () => {
  try {
    const payload = loadAndValidatePayload();
    console.log('RTDB configuration payload validated successfully:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\nUse Firebase CLI or Firebase MCP server tool (realtimedatabase_set_data) to publish to /config.');
  } catch (err) {
    console.error('Provisioning validation error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  provision();
}

module.exports = { loadAndValidatePayload };
