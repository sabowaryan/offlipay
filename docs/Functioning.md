# Fonctionnement Technique de PaperPay

## 1. Architecture Générale du Système

### 1.1 Composants Principaux
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Cryptographie │    │  Ledger Local   │
│     Mobile      │◄──►│     Module      │◄──►│   (SQLite)      │
│   (PWA/Native)  │    │   (ECDSA/AES)   │    │   Chiffré       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Générateur QR  │    │  Validation     │    │ Synchronisation │
│   Offline       │    │   Locale        │    │   Différée      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Stack Technologique
- **Frontend** : PWA (Progressive Web App) avec fallback React Native
- **Stockage** : SQLite chiffré avec AES-256
- **Cryptographie** : ECDSA pour signatures, RSA pour échanges de clés
- **Synchronisation** : API REST avec JWT authentication
- **Interface** : Support multilingue, optimisé pour faible alphabétisation

## 2. Flux de Transaction Détaillé

### 2.1 Phase 1 : Génération de Transaction (Commerçant)

```
Commerçant saisit montant → Génération QR Code
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Données QR Code :                                          │
│  {                                                          │
│    "amount": 1500,                                          │
│    "currency": "XOF",                                       │
│    "merchant_id": "merchant_123",                           │
│    "transaction_id": "tx_456789",                           │
│    "timestamp": "2025-07-05T10:30:00Z",                     │
│    "signature": "3045022100...",                            │
│    "public_key": "04a1b2c3d4..."                            │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

**Étapes détaillées :**
1. **Saisie** : Commerçant entre montant et description
2. **Génération ID** : Création d'un identifiant unique de transaction
3. **Horodatage** : Timestamp précis pour éviter les replays
4. **Signature cryptographique** : Signature ECDSA avec clé privée du commerçant
5. **Encodage QR** : Transformation en QR code scannable

### 2.2 Phase 2 : Validation Transaction (Client)

```
Client scanne QR → Validation → Confirmation
    │                  │              │
    ▼                  ▼              ▼
Décodage QR    Vérification     Enregistrement
               Signature        Ledger Local
```

**Processus de validation :**
1. **Scan QR** : Décodage des données de transaction
2. **Vérification signature** : Validation ECDSA avec clé publique
3. **Contrôle solde** : Vérification du solde local suffisant
4. **Détection double dépense** : Vérification unicité transaction
5. **Confirmation utilisateur** : Validation finale par PIN/biométrie

### 2.3 Phase 3 : Enregistrement Local

```
┌─────────────────────────────────────────────────────────────┐
│  Ledger Local (SQLite) :                                    │
│                                                             │
│  Table: transactions                                        │
│  ├── id (PRIMARY KEY)                                       │
│  ├── transaction_id (UNIQUE)                                │
│  ├── amount                                                 │
│  ├── currency                                               │
│  ├── merchant_id                                            │
│  ├── customer_id                                            │
│  ├── timestamp                                              │
│  ├── signature                                              │
│  ├── status ('pending', 'confirmed', 'synced')             │
│  └── merkle_hash                                            │
│                                                             │
│  Table: balances                                            │
│  ├── user_id (PRIMARY KEY)                                  │
│  ├── current_balance                                        │
│  ├── pending_balance                                        │
│  └── last_update                                            │
└─────────────────────────────────────────────────────────────┘
```

## 3. Mécanismes de Sécurité Offline

### 3.1 Cryptographie Locale

**Génération de clés :**
```
Lors de l'installation :
1. Génération paire de clés ECDSA (secp256k1)
2. Clé privée → Chiffrement AES-256 → Stockage sécurisé
3. Clé publique → Transmission au serveur central
4. Certificat d'authentification → Validation identité
```

**Signature de transaction :**
```
Message = montant + devise + timestamp + merchant_id + nonce
Signature = ECDSA_sign(SHA256(Message), clé_privée)
QR_Code = Base64(Message + Signature + clé_publique)
```

### 3.2 Prévention de la Double Dépense

**Stratégies offline :**
1. **Horodatage précis** : Utilisation NTP local + compteur séquentiel
2. **Nonce unique** : Génération d'identifiants uniques par transaction
3. **Merkle Trees** : Chaînage cryptographique des transactions
4. **Timeouts** : Expiration des QR codes non utilisés (5 minutes)

### 3.3 Validation Locale des Soldes

```
Calcul du solde :
Balance = Solde_initial + Somme(crédits) - Somme(débits)

Vérification :
IF (Balance >= Montant_transaction) 
    AND (Transaction_ID unique)
    AND (Signature valide)
    AND (Timestamp récent)
THEN Autoriser_transaction
ELSE Refuser_transaction
```

## 4. Synchronisation et Réconciliation

### 4.1 Processus de Synchronisation

**Déclencheurs :**
- Connexion internet détectée
- Intervalle programmé (toutes les 6 heures)
- Synchronisation manuelle par l'utilisateur
- Seuil de transactions non synchronisées (>10)

**Étapes de synchronisation :**
```
1. Connexion sécurisée (TLS 1.3)
2. Authentification JWT
3. Envoi transactions locales non synchronisées
4. Réception transactions manquantes du serveur
5. Résolution des conflits (si nécessaire)
6. Mise à jour des soldes
7. Marquage transactions comme synchronisées
```

### 4.2 Résolution des Conflits

**Types de conflits :**
- **Double dépense** : Même transaction sur plusieurs appareils
- **Solde insuffisant** : Découvert non détecté localement
- **Timestamps incohérents** : Horloges non synchronisées

**Algorithme de résolution :**
```
FOR each conflit:
    IF type == "double_spend":
        Garder transaction avec timestamp le plus ancien
    ELIF type == "insufficient_balance":
        Marquer transaction comme "failed"
        Rembourser si nécessaire
    ELIF type == "timestamp_conflict":
        Utiliser timestamp serveur comme référence
```

## 5. Interface Utilisateur et Expérience

### 5.1 Workflow Commerçant

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Saisie    │───►│  Génération │───►│  Affichage  │
│   Montant   │    │  QR Code    │    │  QR Code    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validation  │    │  Signature  │    │  Attente    │
│   Données   │    │Cryptographique│    │   Scan     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 5.2 Workflow Client

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Scan QR    │───►│ Validation  │───►│Confirmation │
│   Code      │    │Transaction  │    │  Paiement   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Décodage   │    │  Vérif      │    │ Enregistrer │
│   Données   │    │  Signature  │    │   Local     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 6. Gestion des Cas d'Usage Spécifiques

### 6.1 Paiement en Zone Sans Réseau

**Scenario :** Marché rural, aucune connectivité
1. **Commerçant** génère QR code pour 2500 XOF
2. **Client** scanne, valide localement la transaction
3. **Enregistrement** dans les ledgers locaux des deux parties
4. **Synchronisation** différée lors du retour en zone couverte

### 6.2 Gestion des Micropaiements

**Optimisations :**
- **Transactions batch** : Regroupement de petites transactions
- **Seuils adaptatifs** : Frais réduits pour micropaiements
- **Validation simplifiée** : Processus accéléré pour montants < 100 XOF

### 6.3 Gestion des Remboursements

**Processus offline :**
1. **Génération QR remboursement** par le commerçant
2. **Validation** par le client
3. **Enregistrement** comme transaction négative
4. **Réconciliation** lors de la synchronisation

## 7. Monitoring et Analytics

### 7.1 Métriques Collectées Localement

- **Volume de transactions** : Nombre et montant
- **Taux de réussite** : Transactions validées/tentées
- **Temps de traitement** : Latence de validation
- **Utilisation offline** : Pourcentage de temps sans connexion

### 7.2 Reporting Automatisé

```
Rapport quotidien généré localement :
{
    "date": "2025-07-05",
    "transactions_count": 47,
    "total_volume": 125000,
    "success_rate": 0.96,
    "offline_percentage": 0.73,
    "sync_attempts": 3
}
```

## 8. Sécurité et Conformité

### 8.1 Chiffrement des Données

- **Données en transit** : TLS 1.3 lors de la synchronisation
- **Données au repos** : AES-256 pour le stockage local
- **Clés privées** : Stockage sécurisé avec accès biométrique

### 8.2 Audit Trail

**Traçabilité complète :**
- Chaque transaction horodatée et signée
- Logs d'accès et de modification
- Historique des synchronisations
- Rapports d'anomalies automatisés

## Conclusion

PaperPay fonctionne comme un système de paiement véritablement autonome, capable de traiter des transactions sécurisées même sans connectivité. La combinaison de cryptographie locale, de validation décentralisée et de synchronisation intelligente permet une expérience utilisateur fluide tout en maintenant la sécurité et l'intégrité des transactions.

La robustesse du système repose sur sa capacité à gérer les cas d'usage complexes (conflits, fraude, réconciliation) tout en restant simple d'utilisation pour des populations à faible alphabétisation numérique.