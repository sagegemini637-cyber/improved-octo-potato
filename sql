-- Core Tables
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_plan VARCHAR(50),
  industry VARCHAR(50),
  kes_limit DECIMAL(15,2),
  status ENUM('active', 'inactive', 'trial'),
  trial_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_data (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  data_type VARCHAR(50), -- 'sales', 'inventory', 'patients', etc
  data_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY,
  admin_id UUID,
  action VARCHAR(100),
  client_id UUID,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  model_type VARCHAR(50),
  input_data JSONB,
  prediction_result JSONB,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  file_name VARCHAR(255),
  file_size INT,
  file_type VARCHAR(50),
  s3_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
