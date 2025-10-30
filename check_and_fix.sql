-- Vérifier l'utilisateur actuel
SELECT username, insurance_company, role, is_active, status FROM users WHERE username = 'admin';

-- Corriger complètement l'utilisateur admin
UPDATE users SET 
    insurance_company = 'système',
    is_active = true,
    status = 'REGISTERED',
    subscription_active = true,
    subscription_status = 'ACTIVE'
WHERE username = 'admin';

-- Vérifier après correction
SELECT username, insurance_company, role, is_active, status FROM users WHERE username = 'admin';
