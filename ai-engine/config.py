"""
Configuration Management Module
Handles loading and managing application configuration
"""

import os
import yaml
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for Smart Safety Vision system"""
    
    def __init__(self, config_path: str = "config.yaml"):
        """
        Initialize configuration
        
        Args:
            config_path: Path to YAML configuration file
        """
        self.config_path = config_path
        self.config = self._load_config()
        self._load_env_variables()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            return config
        except FileNotFoundError:
            print(f"Warning: Config file {self.config_path} not found. Using defaults.")
            return self._get_default_config()
    
    def _load_env_variables(self):
        """Load environment variables and override config"""
        # Telegram settings
        self.tg_bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        self.telegram_chat_id = os.getenv('TELEGRAM_CHAT_ID', '')
        
        # Model settings
        self.model_path = os.getenv('MODEL_PATH', self.config['model']['weights'])
        self.confidence = float(os.getenv('CONFIDENCE_THRESHOLD', 
                                         self.config['model']['confidence_threshold']))
        
        # Camera settings
        camera_source = os.getenv('CAMERA_SOURCE', self.config['camera']['source'])
        # Convert to int if it's a digit, otherwise keep as string (for IP camera URLs)
        self.camera_source = int(camera_source) if str(camera_source).isdigit() else camera_source
        
        # Database settings
        self.database_path = os.getenv('DATABASE_PATH', self.config['database']['path'])
        
        # Application settings
        self.debug_mode = os.getenv('DEBUG_MODE', 'False').lower() == 'true'
        self.log_level = os.getenv('LOG_LEVEL', self.config['logging']['level'])
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Return default configuration"""
        return {
            'model': {
                'weights': 'models/best.pt',
                'confidence_threshold': 0.5,
                'iou_threshold': 0.45,
                'device': 'cpu',
                'img_size': 640
            },
            'camera': {
                'source': 0,
                'fps': 30,
                'resolution': {'width': 1280, 'height': 720}
            },
            'alerts': {
                'telegram': {
                    'enabled': True,
                    'cooldown_seconds': 60,
                    'send_image': True
                }
            },
            'database': {
                'type': 'sqlite',
                'path': 'logs/detections.db',
                'save_violation_images': True,
                'image_folder': 'logs/violations'
            },
            'logging': {
                'level': 'INFO',
                'file': 'logs/app.log'
            },
            'performance': {
                'skip_frames': 0,
                'max_detections': 50,
                'track_objects': True
            }
        }
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value by key (supports nested keys with dot notation)
        
        Args:
            key: Configuration key (e.g., 'model.confidence_threshold')
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """
        Set configuration value
        
        Args:
            key: Configuration key (supports dot notation)
            value: Value to set
        """
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
    
    def save(self, path: str = None):
        """
        Save configuration to YAML file
        
        Args:
            path: Path to save configuration (default: original config_path)
        """
        save_path = path or self.config_path
        with open(save_path, 'w', encoding='utf-8') as f:
            yaml.dump(self.config, f, default_flow_style=False)
    
    def create_directories(self):
        """Create necessary directories for the application"""
        directories = [
            'models',
            'logs',
            'logs/violations',
            'data/train',
            'data/valid',
            'data/test'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    def __repr__(self):
        return f"Config(path={self.config_path})"


# Global configuration instance
config = Config()

if __name__ == "__main__":
    # Test configuration
    print("Configuration loaded successfully!")
    print(f"Model path: {config.model_path}")
    print(f"Confidence threshold: {config.confidence}")
    print(f"Camera source: {config.camera_source}")
    print(f"Telegram enabled: {config.get('alerts.telegram.enabled')}")
    
    # Create necessary directories
    config.create_directories()
    print("Directories created successfully!")
