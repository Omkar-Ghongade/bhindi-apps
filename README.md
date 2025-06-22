# Bhindi Agent Starter Kit - Architecture Diagram

## System Overview

This architecture diagram focuses on the three main tool categories: **UPI Tools**, **Cashfree Tools**, and **Bhindi Tools** within the Bhindi Agent Starter Kit.

## Architecture Components

```mermaid
graph LR
    %% Client Layer
    Client[Client Applications]
    
    %% API Gateway Layer
    API[API Gateway<br/>Express.js Server]
    
    %% Controller Layer
    Controller[AppController<br/>Tool Handler]
    
    %% Service Layer
    subgraph "Service Layer"
        CashfreeService[CashfreeService<br/>Payment Link Creation]
        BhindiService[BhindiService<br/>Agent Operations]
        SplitwiseService[SplitwiseService<br/>Expense Management]
    end
    
    %% External APIs
    subgraph "External APIs"
        CashfreeAPI[Cashfree API<br/>Payment Gateway]
        BhindiAPI[Bhindi API<br/>Agent Platform]
        SplitwiseAPI[Splitwise API<br/>UPI Payments]
    end
    
    %% Configuration
    Config[tools.json<br/>Tool Definitions]
    
    %% Flow Connections
    Client --> API
    API --> Controller
    Controller --> Config
    Controller --> CashfreeService
    Controller --> BhindiService
    Controller --> SplitwiseService
    CashfreeService --> CashfreeAPI
    BhindiService --> BhindiAPI
    
    %% UPI Tools (via Splitwise)
    SplitwiseService -.->|UPI Tools| SplitwiseAPI
    
    %% Styling
    classDef clientClass fill:#e1f5fe
    classDef apiClass fill:#f3e5f5
    classDef serviceClass fill:#e8f5e8
    classDef externalClass fill:#fff3e0
    classDef configClass fill:#fce4ec
    
    class Client clientClass
    class API,Controller apiClass
    class CashfreeService,BhindiService,SplitwiseService serviceClass
    class CashfreeAPI,BhindiAPI,SplitwiseAPI externalClass
    class Config configClass
```

## Tool Categories Breakdown

### 1. UPI Tools (via Splitwise Service)
```mermaid
graph LR
    subgraph "UPI Tools"
        UPI1[getCurrentUser]
        UPI2[getUser]
        UPI3[getGroups]
        UPI4[getGroup]
        UPI5[createGroup]
        UPI6[deleteGroup]
        UPI7[getFriends]
        UPI8[getFriend]
        UPI9[createFriend]
        UPI10[deleteFriend]
        UPI11[getExpenses]
        UPI12[getExpense]
        UPI13[createExpense]
        UPI14[getComments]
    end
    
    subgraph "UPI Payment Integration"
        Splitwise[Python UPI Script<br/>app.py]
        UPI_Payment[UPI Payment Flow]
    end
    
    UPI1 --> Splitwise
    UPI2 --> Splitwise
    UPI13 --> UPI_Payment
    
    classDef upiClass fill:#e3f2fd
    class UPI1,UPI2,UPI3,UPI4,UPI5,UPI6,UPI7,UPI8,UPI9,UPI10,UPI11,UPI12,UPI13,UPI14 upiClass
```

### 2. Cashfree Tools
```mermaid
graph LR
    subgraph "Cashfree Tools"
        CF1[createPaymentLink]
    end
    
    subgraph "Cashfree Features"
        CF2[Payment Link Generation]
        CF3[UPI Intent Flow]
        CF4[Email/SMS Notifications]
        CF5[Partial Payments]
        CF6[Auto Reminders]
    end
    
    subgraph "Cashfree API Integration"
        CF_API[Cashfree Sandbox API]
        CF_Headers[API Headers<br/>x-api-version<br/>x-client-id<br/>x-client-secret]
    end
    
    CF1 --> CF2
    CF2 --> CF3
    CF2 --> CF4
    CF2 --> CF5
    CF2 --> CF6
    CF2 --> CF_API
    CF_API --> CF_Headers
    
    classDef cashfreeClass fill:#e8f5e8
    class CF1,CF2,CF3,CF4,CF5,CF6 cashfreeClass
```

### 3. Bhindi Tools
```mermaid
graph LR
    subgraph "Bhindi Tools"
        BH1[getChat]
    end
    
    subgraph "Bhindi Features"
        BH2[Chat History]
        BH3[Message Retrieval]
        BH4[Agent Communication]
    end
    
    subgraph "Bhindi API Integration"
        BH_API[Bhindi Agent API]
        BH_Auth[Bearer Token Auth]
    end
    
    BH1 --> BH2
    BH1 --> BH3
    BH1 --> BH4
    BH4 --> BH_API
    BH_API --> BH_Auth
    
    classDef bhindiClass fill:#fff3e0
    class BH1,BH2,BH3,BH4 bhindiClass
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant API as Express Server
    participant Controller as AppController
    participant Config as tools.json
    participant Service as Service Layer
    participant External as External APIs
    
    Client->>API: Tool Request
    API->>Controller: Route to Controller
    Controller->>Config: Load Tool Definition
    Config-->>Controller: Tool Schema
    
    alt UPI Tool
        Controller->>Service: SplitwiseService
        Service->>External: Splitwise API
        External-->>Service: UPI Response
        Service-->>Controller: Processed Data
    else Cashfree Tool
        Controller->>Service: CashfreeService
        Service->>External: Cashfree API
        External-->>Service: Payment Link
        Service-->>Controller: Link Data
    else Bhindi Tool
        Controller->>Service: BhindiService
        Service->>External: Bhindi API
        External-->>Service: Chat Data
        Service-->>Controller: Messages
    end
    
    Controller-->>API: Tool Response
    API-->>Client: JSON Response
```

## Authentication & Security

```mermaid
graph TB
    subgraph "Authentication Methods"
        Bearer[Bearer Token<br/>GitHub/Bhindi]
        APIKey[API Key<br/>Splitwise]
        CashfreeAuth[API Key + Secret<br/>Cashfree]
    end
    
    subgraph "Security Headers"
        Headers1[x-api-version]
        Headers2[x-client-id]
        Headers3[x-client-secret]
        Headers4[Authorization]
        Headers5[x-splitwise-key]
    end
    
    Bearer --> Headers4
    APIKey --> Headers5
    CashfreeAuth --> Headers2
    CashfreeAuth --> Headers3
    CashfreeAuth --> Headers1
    
    classDef authClass fill:#ffebee
    class Bearer,APIKey,CashfreeAuth authClass
```

## File Structure for Tool Categories

```
src/
├── controllers/
│   └── appController.ts          # Main tool handler
├── services/
│   ├── cashfreeService.ts        # Cashfree payment operations
│   ├── bhindiService.ts          # Bhindi agent operations
│   └── splitwiseService.ts       # UPI tools (via Splitwise)
├── config/
│   └── tools.json               # Tool definitions & schemas
└── app.py                       # Python UPI payment script
```

## Key Features by Tool Category

### UPI Tools (14 tools)
- **User Management**: getCurrentUser, getUser, getFriends, createFriend, deleteFriend
- **Group Management**: getGroups, getGroup, createGroup, deleteGroup
- **Expense Management**: getExpenses, getExpense, createExpense, getComments
- **Payment Integration**: Python script for direct UPI payments via Splitwise

### Cashfree Tools (1 tool)
- **Payment Link Creation**: createPaymentLink with comprehensive features
- **UPI Intent Flow**: Support for UPI-based payments
- **Notification System**: Email and SMS notifications
- **Partial Payments**: Support for installment payments
- **Auto Reminders**: Automated payment reminders

### Bhindi Tools (1 tool)
- **Chat Management**: getChat for retrieving conversation history
- **Agent Communication**: Integration with Bhindi agent platform
- **Message Retrieval**: Access to chat messages and responses

## Technology Stack

- **Backend**: Node.js with Express.js
- **Language**: TypeScript
- **Payment Gateway**: Cashfree API (sandbox)
- **UPI Integration**: Splitwise API (Python script)
- **Agent Platform**: Bhindi API
- **Configuration**: JSON-based tool definitions
- **Authentication**: Multiple auth methods (Bearer, API Key, OAuth) 
