import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

CONTRACT_ABI = json.loads('''[
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "batchId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "eventType", "type": "string"},
      {"indexed": false, "internalType": "bytes32", "name": "eventHash", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "recorder", "type": "address"}
    ],
    "name": "TraceabilityRecorded",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "batchId", "type": "string"},
      {"internalType": "string", "name": "eventType", "type": "string"},
      {"internalType": "bytes32", "name": "eventHash", "type": "bytes32"}
    ],
    "name": "recordEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "batchId", "type": "string"},
      {"internalType": "string", "name": "eventType", "type": "string"}
    ],
    "name": "getRecord",
    "outputs": [
      {"internalType": "bytes32", "name": "eventHash", "type": "bytes32"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "address", "name": "recorder", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "batchId", "type": "string"},
      {"internalType": "string", "name": "eventType", "type": "string"},
      {"internalType": "bytes32", "name": "expectedHash", "type": "bytes32"}
    ],
    "name": "verifyRecord",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
]''')


class BlockchainService:
    _web3 = None
    _contract = None

    @classmethod
    def is_configured(cls):
        return bool(
            settings.BLOCKCHAIN_RPC_URL
            and settings.BLOCKCHAIN_PRIVATE_KEY
            and settings.HONEYTRACE_CONTRACT_ADDRESS
        )

    @classmethod
    def _get_web3(cls):
        if cls._web3 is None:
            from web3 import Web3
            cls._web3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
        return cls._web3

    @classmethod
    def _get_contract(cls):
        if cls._contract is None and cls.is_configured():
            from web3 import Web3
            w3 = cls._get_web3()
            cls._contract = w3.eth.contract(
                address=Web3.to_checksum_address(settings.HONEYTRACE_CONTRACT_ADDRESS),
                abi=CONTRACT_ABI,
            )
        return cls._contract

    @classmethod
    def _hash_to_bytes32(cls, event_hash):
        from web3 import Web3
        h = event_hash.replace('0x', '')
        return Web3.to_bytes(hexstr='0x' + h.zfill(64)[:64])

    @classmethod
    def record_event(cls, batch_id, event_type, event_hash):
        if not cls.is_configured():
            logger.warning('Blockchain not configured — event saved to DB only')
            return {'success': False, 'error': 'blockchain_not_configured'}

        try:
            from web3 import Web3
            w3 = cls._get_web3()
            if not w3.is_connected():
                return {'success': False, 'error': 'blockchain_unreachable'}

            contract = cls._get_contract()
            account = w3.eth.account.from_key(settings.BLOCKCHAIN_PRIVATE_KEY)
            hash_bytes = cls._hash_to_bytes32(event_hash)

            nonce = w3.eth.get_transaction_count(account.address)
            tx = contract.functions.recordEvent(batch_id, event_type, hash_bytes).build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'chainId': w3.eth.chain_id,
            })
            signed = account.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

            return {
                'success': receipt.status == 1,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'network': settings.BLOCKCHAIN_NETWORK,
            }
        except Exception as e:
            logger.exception('Blockchain record failed: %s', e)
            return {'success': False, 'error': str(e)}

    @classmethod
    def verify_event(cls, batch_id, event_type, event_hash, tx_hash=None):
        if not cls.is_configured():
            return True

        try:
            from web3 import Web3
            w3 = cls._get_web3()
            if not w3.is_connected():
                return False

            contract = cls._get_contract()
            hash_bytes = cls._hash_to_bytes32(event_hash)
            return contract.functions.verifyRecord(batch_id, event_type, hash_bytes).call()
        except Exception:
            return False
