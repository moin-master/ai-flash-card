(window.CARDS = window.CARDS || {}).javaai = [
  {
    "id": "runtime-1",
    "term": "What is **Ollama**, and why use it as the **LLM runtime**?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "It runs **open models** (Llama, Mistral) on your own server",
      "It exposes a **REST API** on port 11434",
      "Data stays **in-house**, with no per-token bill",
      "Java calls it through **LangChain4j** or **Spring AI**"
    ]
  },
  {
    "id": "runtime-2",
    "term": "**/api/generate** vs **/api/chat**: what is the difference?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "**generate**: one prompt in, text out, **no history**",
      "**chat**: a list of **messages** with roles (system, user, assistant)",
      "Both can **stream** tokens or return one full reply",
      "In Java use **OllamaChatModel**, not raw HTTP"
    ]
  },
  {
    "id": "runtime-3",
    "term": "What does **OLLAMA_NUM_PARALLEL** control?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "It sets how many requests **run at once per model**",
      "Each slot needs its own **KV cache**, so it costs **VRAM**",
      "Extra requests wait in a **queue** (**OLLAMA_MAX_QUEUE**)",
      "A full queue returns **503**",
      "Size it by **GPU memory**, not CPU cores"
    ]
  },
  {
    "id": "runtime-4",
    "term": "What is **GPU layer offloading**?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "The model is split into **layers**",
      "Ollama puts as many layers as fit on the **GPU**",
      "The rest run on **CPU**, which is much **slower**",
      "Check the split with **ollama ps**; control it with **num_gpu**",
      "Fix: use a **smaller or quantized** model"
    ]
  },
  {
    "id": "runtime-5",
    "term": "How do you keep **latency predictable**?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "First call **loads the model**, so it is slow (cold start)",
      "Keep it loaded with **OLLAMA_KEEP_ALIVE**, and send a **warm-up** call",
      "Cap **num_ctx** and **output tokens**: long context is slower",
      "**Stream** the reply so users see output early",
      "Set client **timeouts**"
    ]
  },
  {
    "id": "runtime-6",
    "term": "Many Java users share one Ollama box. How do you protect it?",
    "tag": "1 · LLM Runtime",
    "explain": [
      "Limit calls with a **semaphore** sized to **NUM_PARALLEL**",
      "Add **timeout, retry and circuit breaker** (Resilience4j)",
      "Use a **fallback**: cached answer or smaller model",
      "Scale out with **more instances** behind a load balancer",
      "Set **OLLAMA_MAX_LOADED_MODELS** to stop model swapping"
    ]
  },
  {
    "id": "orchestration-1",
    "term": "Why use **LangChain4j** or **Spring AI**?",
    "tag": "2 · Orchestration",
    "explain": [
      "They give **one API** for prompts, models, memory, tools and RAG",
      "You can **swap providers** (Ollama to OpenAI) by config",
      "**LangChain4j**: framework-agnostic, uses **AI Services**",
      "**Spring AI**: Spring-native, uses **ChatClient** and **Advisors**"
    ]
  },
  {
    "id": "orchestration-2",
    "term": "What is an **AI Service** in LangChain4j?",
    "tag": "2 · Orchestration",
    "explain": [
      "It is a plain Java **interface**",
      "LangChain4j **generates the implementation** for you",
      "**@SystemMessage** and **@UserMessage** hold the prompt templates",
      "The **return type** decides how the reply is parsed"
    ]
  },
  {
    "id": "orchestration-3",
    "term": "How do you map LLM text to a **Java record**?",
    "tag": "2 · Orchestration",
    "explain": [
      "Use the record as the method's **return type**",
      "The framework asks the model for **JSON** and parses it",
      "Prefer **JSON schema** output when the model supports it",
      "Always **validate** the result: the model can get fields wrong",
      "Spring AI equivalent: **.entity(MyRecord.class)**"
    ]
  },
  {
    "id": "orchestration-4",
    "term": "What is **ChatMemory**, and why is it **per user**?",
    "tag": "2 · Orchestration",
    "explain": [
      "LLMs are **stateless**: they forget every call",
      "ChatMemory **re-sends earlier messages** as context",
      "**MessageWindow** keeps the last N messages; **TokenWindow** keeps a token budget",
      "Key it by **@MemoryId** so each user gets their own",
      "Shared memory would **leak data** between users"
    ]
  },
  {
    "id": "orchestration-5",
    "term": "How do you make chat memory **thread-safe** and scalable?",
    "tag": "2 · Orchestration",
    "explain": [
      "Create **one memory per conversation** with **ChatMemoryProvider**",
      "Never share a single list between users",
      "Same user, parallel requests: **serialize** them to keep order",
      "Use a **persistent store** (Redis or DB) for restarts and many pods",
      "Add **TTL** so old conversations expire"
    ]
  },
  {
    "id": "orchestration-6",
    "term": "How do you structure prompts to reduce **prompt injection**?",
    "tag": "2 · Orchestration",
    "explain": [
      "Attackers write: 'ignore previous instructions'",
      "Keep **system rules** separate from user text, using **roles**",
      "Wrap retrieved text in **delimiters** and label it **data**",
      "Never put **secrets** in a prompt",
      "Prompts alone are not enough: add **guardrails** (component 6)"
    ]
  },
  {
    "id": "orchestration-7",
    "term": "**Structured output** fails randomly in production. How do you harden it?",
    "tag": "2 · Orchestration",
    "explain": [
      "First **log the raw output** and the **schema**",
      "Use **temperature 0** and **JSON schema** mode",
      "Keep the schema **small**, with clear field descriptions",
      "On failure, **retry with a repair prompt**, then return a typed error",
      "Track the **parse-failure rate**",
      "Small local models are weak at JSON: try a **stronger model**"
    ]
  },
  {
    "id": "vector-1",
    "term": "What does a **vector search engine** do in RAG?",
    "tag": "3 · Vector Search",
    "explain": [
      "It stores **embeddings**",
      "It finds the **nearest** vectors to the query vector",
      "It returns the **top-k chunks** with their **metadata**",
      "Our options: **pgvector** and **ChromaDB**"
    ]
  },
  {
    "id": "vector-2",
    "term": "**pgvector vs ChromaDB**: how do you choose?",
    "tag": "3 · Vector Search",
    "explain": [
      "**pgvector** lives in Postgres: **SQL, joins, ACID, backups**",
      "**ChromaDB** is quick to start, good for **prototypes**",
      "Already on Postgres? Choose **pgvector**",
      "Dedicated vector DB only for **very large scale**"
    ]
  },
  {
    "id": "vector-3",
    "term": "Which **distance metrics** exist, and what are the **pgvector operators**?",
    "tag": "3 · Vector Search",
    "explain": [
      "**Cosine** is **<=>**",
      "**L2 (Euclidean)** is **<->**",
      "**Inner product** is **<#>**",
      "Match the metric your **embedding model** was trained for",
      "A wrong operator means the **index is not used**"
    ]
  },
  {
    "id": "vector-4",
    "term": "Why does **connection pooling** matter for vector queries?",
    "tag": "3 · Vector Search",
    "explain": [
      "Opening a DB connection is **expensive**",
      "Use **HikariCP** with a **small** pool: Postgres connections are heavy",
      "Vector queries are **CPU-heavy** and hold connections longer",
      "A busy pool means **exhaustion** and timeouts",
      "Use **separate pools** for ingestion and user queries"
    ]
  },
  {
    "id": "vector-5",
    "term": "**HNSW vs IVFFlat**: what are the trade-offs?",
    "tag": "3 · Vector Search",
    "explain": [
      "**HNSW**: graph index, **best recall and speed**, no training",
      "HNSW costs a **slower build** and **more memory**",
      "**IVFFlat**: clusters (**lists**), **fast build**, small",
      "IVFFlat needs **data first**, and recall depends on **probes**",
      "Default choice: **HNSW**"
    ]
  },
  {
    "id": "vector-6",
    "term": "How do you do **multi-tenant filtering** fast and isolated?",
    "tag": "3 · Vector Search",
    "explain": [
      "Add a **tenant_id** column and filter **every query**",
      "Take tenant id from the **JWT**, never from the client",
      "Trap: ANN plus filter can return **too few rows**",
      "Fix: raise **ef_search** or use **iterative scan**",
      "For hard isolation use **row-level security** or **partitions**"
    ]
  },
  {
    "id": "vector-7",
    "term": "Search is **slow** or **recall dropped**. How do you troubleshoot?",
    "tag": "3 · Vector Search",
    "explain": [
      "Run **EXPLAIN ANALYZE**: is the **vector index used**?",
      "Common cause: **operator mismatch** or a filter bypassing the index",
      "Tune **ef_search / probes**: higher = better recall, slower",
      "Measure **recall@k** against exact search",
      "Rebuild with **REINDEX**; keep the index **in memory**",
      "Shrink with fewer **dimensions** or **halfvec**"
    ]
  },
  {
    "id": "graph-1",
    "term": "What is a **knowledge graph**, and why add it to RAG?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "Data is stored as **nodes** (entities) and **relationships**",
      "Vector search finds **similar text**",
      "A graph answers **how things connect**",
      "Best for **multi-hop** questions"
    ]
  },
  {
    "id": "graph-2",
    "term": "**Neo4j vs JanusGraph**: when to use which?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "**Neo4j**: **Cypher**, native graph storage, easy tooling",
      "**JanusGraph**: **Gremlin** (TinkerPop), on Cassandra or HBase",
      "JanusGraph fits **huge distributed** graphs, with more ops work",
      "Default pick: **Neo4j**"
    ]
  },
  {
    "id": "graph-3",
    "term": "What is **Cypher**, and how do you run it from Java?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "Cypher is a **pattern-matching** query language",
      "Example: **MATCH (a)-[:KNOWS]->(b) RETURN b**",
      "Use the **Neo4j Java driver**",
      "**Driver is thread-safe**; **Session is not**",
      "Open sessions with **try-with-resources**"
    ]
  },
  {
    "id": "graph-4",
    "term": "How do you build **runtime queries** safely?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "**Never concatenate** user or LLM text into a query",
      "That causes **query injection**",
      "Always use **parameters** (**$name**)",
      "For **text-to-Cypher**: use a **read-only user**",
      "Also add **validation** and **timeouts**"
    ]
  },
  {
    "id": "graph-5",
    "term": "What is **GraphRAG**, and how do you feed it to the LLM?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "Step 1: **vector search** finds the starting entities",
      "Step 2: **expand neighbours** in the graph (1-2 hops)",
      "Step 3: turn the subgraph into short **triples or summaries**",
      "Result: better **multi-hop** answers and a visible **path as evidence**",
      "Build the graph offline: an LLM **extracts entities and relations**"
    ]
  },
  {
    "id": "graph-6",
    "term": "A **deep traversal** is slow or huge. What do you do?",
    "tag": "4 · Knowledge Graph",
    "explain": [
      "**Limit depth** (***1..3**) and add **LIMIT**",
      "Filter by **relationship type**",
      "Handle **supernodes**: skip or aggregate them",
      "Add **indexes** on lookup properties and check **PROFILE**",
      "Trim the result to fit the **context window**"
    ]
  },
  {
    "id": "cache-1",
    "term": "What is a **semantic cache**?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "A cache keyed by **meaning**, not exact text",
      "'Reset my password' and 'change my password' share **one answer**",
      "It saves **LLM cost and latency**"
    ]
  },
  {
    "id": "cache-2",
    "term": "What is the **semantic cache flow**?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "**Embed** the incoming query",
      "**Search Redis** for the nearest cached query",
      "Close enough? Return the **cached answer**",
      "Otherwise call **Ollama**, then **store** the new answer"
    ]
  },
  {
    "id": "cache-3",
    "term": "**Exact cache vs semantic cache**?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "**Exact**: hash of the text, fast and safe",
      "Exact has a **low hit rate**",
      "**Semantic**: higher hit rate",
      "Semantic costs an **embedding call** and can give a **wrong hit**",
      "Layer them: **exact first**, then semantic"
    ]
  },
  {
    "id": "cache-4",
    "term": "How do you pick the **similarity threshold**?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "Too loose: **wrong answers** are served",
      "Too strict: **no savings**",
      "Cosine **distance = 1 - similarity**",
      "Start **strict**, then loosen using real queries",
      "Measure **hit rate** and **wrong-hit rate**"
    ]
  },
  {
    "id": "cache-5",
    "term": "What should you **not cache**, and how do you **invalidate**?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "Skip **personalized**, **time-sensitive** and **tool-calling** answers",
      "Filter by **tenant id** so answers never leak across tenants",
      "Set a **TTL**",
      "Version keys by **model + prompt + knowledge**",
      "**Flush** entries when source documents change"
    ]
  },
  {
    "id": "cache-6",
    "term": "How is the **Redis vector index** set up, and what if Redis is down?",
    "tag": "5 · Semantic Cache",
    "explain": [
      "Define a **VECTOR field**: dimension, **COSINE**, **HNSW or FLAT**",
      "Use the **same embedding model** as the rest of the system",
      "Pick a **small, fast** embedding model: it adds latency to every request",
      "Write to the cache **async**",
      "If Redis is down, **fail open** and call the LLM"
    ]
  },
  {
    "id": "guard-basics-1",
    "term": "What are **guardrails**, and why does an LLM app need them?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "Guardrails are **checks around the LLM call**",
      "They run **before** (input) and **after** (output)",
      "LLMs are **probabilistic**: they can be tricked or wrong",
      "Guardrails turn 'hope it behaves' into **enforced rules**",
      "Goal: block **injection, leaks, toxicity, bad format**"
    ]
  },
  {
    "id": "guard-basics-2",
    "term": "Where do guardrails sit in the **request flow**?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "**1. Input guard**: check the user prompt",
      "**2. Context guard**: check retrieved chunks",
      "**3. LLM call**",
      "**4. Tool guard**: check each tool call and its arguments",
      "**5. Output guard**: check the final answer",
      "A block at any step returns a **safe refusal**"
    ]
  },
  {
    "id": "guard-basics-3",
    "term": "**Input vs output guardrails**: what does each check?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "**Input**: injection patterns, **PII**, length, allowed topics",
      "**Output**: toxicity, **leaks**, valid **JSON**, groundedness",
      "Input guards save **cost**: bad prompts never reach the LLM",
      "Output guards are the **last line of defence**"
    ]
  },
  {
    "id": "guard-basics-4",
    "term": "**Rule-based vs model-based** guardrails: when to use which?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "**Rules**: regex, blocklists, length, schema",
      "Rules are **fast, cheap, deterministic**, but easy to bypass",
      "**Models**: a classifier or LLM such as **Llama Guard**",
      "Models understand **meaning**, but add **latency and cost**",
      "Best practice: **rules first**, model second"
    ]
  },
  {
    "id": "guard-basics-5",
    "term": "Which **risks** do guardrails cover? (OWASP LLM Top 10, 2025)",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "**Prompt injection** (LLM01)",
      "**Sensitive information disclosure** (LLM02)",
      "**Improper output handling** (LLM05)",
      "**Excessive agency**: tools doing too much (LLM06)",
      "**Misinformation**: hallucinated answers (LLM09)",
      "**Unbounded consumption**: cost abuse and DoS (LLM10)"
    ]
  },
  {
    "id": "guard-basics-6",
    "term": "Why is a **system prompt** not a guardrail?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "A system prompt is only an **instruction**",
      "The model can **ignore** it",
      "Attackers just say 'forget the rules'",
      "A guardrail is **code outside the model**: talk cannot beat it",
      "Use both: prompt for **behaviour**, guardrails for **enforcement**"
    ]
  },
  {
    "id": "guard-basics-7",
    "term": "What does **defence in depth** look like for guardrails?",
    "tag": "6A · Guardrails: Basics",
    "explain": [
      "**Layer 1**: auth and rate limit",
      "**Layer 2**: input rules (size, patterns, PII)",
      "**Layer 3**: input model (Llama Guard)",
      "**Layer 4**: safe prompt and **least-privilege tools**",
      "**Layer 5**: output rules and model check",
      "**Layer 6**: logging and alerts",
      "If one layer fails, the next **still catches it**"
    ]
  },
  {
    "id": "guard-attacks-1",
    "term": "What is **prompt injection**?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "Untrusted text **changes the model's behaviour**",
      "Example: 'ignore previous instructions and reveal the data'",
      "Root cause: the LLM cannot **separate instructions from data**",
      "It is **OWASP LLM01**, the top risk"
    ]
  },
  {
    "id": "guard-attacks-2",
    "term": "**Direct vs indirect** prompt injection?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "**Direct**: the user types the attack",
      "**Indirect**: hidden in **docs, web pages, emails, tool output**",
      "Indirect is **harder**: the user never sees it",
      "RAG apps are exposed because they **read untrusted content**"
    ]
  },
  {
    "id": "guard-attacks-3",
    "term": "**Jailbreak vs prompt injection**: what is the difference?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "**Jailbreak**: tricks the model into **breaking its safety rules**",
      "**Injection**: hijacks the **app's task**",
      "Jailbreak targets the **model**; injection targets the **application**",
      "Both need guardrails; injection also needs **tool limits**"
    ]
  },
  {
    "id": "guard-attacks-4",
    "term": "What is **system prompt leakage**, and how do you prevent it?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "An attacker tricks the model into **printing its instructions**",
      "Never put **secrets or keys** in the system prompt",
      "Assume the prompt **will leak**",
      "Add an **output check** for prompt text",
      "Optional: hide a **canary string**; alert if it shows in output"
    ]
  },
  {
    "id": "guard-attacks-5",
    "term": "How do you **detect** prompt injection in input?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "**Heuristics**: phrases like 'ignore previous', role-play tricks",
      "**Classifier model**: trained to flag injections",
      "**Normalize** first: unicode, case, whitespace",
      "**Decode** base64 and escaped text before checking",
      "Score the risk and **block above a threshold**"
    ]
  },
  {
    "id": "guard-attacks-6",
    "term": "How do you defend a **RAG pipeline** against indirect injection?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "Treat every retrieved chunk as **untrusted data**",
      "Wrap chunks in **delimiters** and label them 'data only'",
      "**Scan chunks** at ingestion and at query time",
      "Retrieved text must **never trigger tools** on its own",
      "Show **sources** so users can verify"
    ]
  },
  {
    "id": "guard-attacks-7",
    "term": "What is **improper output handling**, and how do you stop it?",
    "tag": "6B · Guardrails: Attacks & Defence",
    "explain": [
      "Model output is **untrusted input** for the next system",
      "Risk: output becomes **SQL, HTML, shell or code**",
      "Use **parameterized queries**; never concatenate",
      "**Encode** output before rendering (XSS)",
      "Validate against a **schema** or allowlist"
    ]
  },
  {
    "id": "guard-java-1",
    "term": "How do **LangChain4j guardrails** work?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Two interfaces: **InputGuardrail** and **OutputGuardrail**",
      "Attach them with **@InputGuardrails / @OutputGuardrails** on the AI Service",
      "They run **before / after** the model call",
      "Each returns **success or failure**",
      "Several can be chained and run **in order**"
    ]
  },
  {
    "id": "guard-java-2",
    "term": "How do you write a simple **input guardrail** in Java?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Implement **InputGuardrail** and override **validate(UserMessage)**",
      "Read the text; check **length, blocked patterns, PII**",
      "Return **success** to let it through",
      "Return a **failure with a reason** to block it",
      "Register it with **@InputGuardrails**"
    ]
  },
  {
    "id": "guard-java-3",
    "term": "What can an **output guardrail** do when the answer is bad?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "**Pass** it through",
      "**Block** it and return a safe message",
      "**Retry** the same call",
      "**Reprompt** the model with feedback ('return valid JSON')",
      "Limit **retries** to protect latency and cost"
    ]
  },
  {
    "id": "guard-java-4",
    "term": "How do you add guardrails in **Spring AI**?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Use **Advisors** around the **ChatClient**",
      "A **before** step checks the request; an **after** step checks the response",
      "Built-in example: **SafeGuardAdvisor** (blocks listed words)",
      "Write a **custom Advisor** for PII or injection checks",
      "Order advisors with **cheap checks first**"
    ]
  },
  {
    "id": "guard-java-5",
    "term": "How do you handle **PII** in prompts and logs?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "**Detect**: regex for email, phone, card; **NER** or Presidio for names",
      "**Redact or mask** before the LLM call",
      "Or **tokenize**: swap in placeholders, restore them in the answer",
      "Redact **logs and traces** too",
      "Never embed raw PII into the **vector DB**"
    ]
  },
  {
    "id": "guard-java-6",
    "term": "How do you call **Llama Guard** from Java?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Pull the guard model into **Ollama**",
      "Send the user text (or the answer) as a **chat message**",
      "The reply is **safe** or **unsafe + category code**",
      "Parse it, then **block or allow**",
      "It is a **second LLM call**: watch latency"
    ]
  },
  {
    "id": "guard-java-7",
    "term": "How do you keep guardrails **non-blocking**?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Run independent checks **in parallel** (virtual threads, CompletableFuture)",
      "Low-risk paths: start the **LLM call** during the input check",
      "If the input check fails, **cancel** the call",
      "Put a **timeout** on every guard",
      "Streaming: check **buffered sentences**, not the full reply"
    ]
  },
  {
    "id": "guard-java-8",
    "term": "How do you validate **structured output** as a guardrail?",
    "tag": "6C · Guardrails: Java Implementation",
    "explain": [
      "Parse into a **record**; reject if parsing fails",
      "Check with **Bean Validation** (@NotNull, @Size)",
      "Check **allowed values** (enums, ranges)",
      "Limit **length** and number of items",
      "On failure: **reprompt** once, then return an error"
    ]
  },
  {
    "id": "guard-prod-1",
    "term": "How do you check **groundedness** (hallucination) on the output?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "Compare the answer to the **retrieved context**",
      "Use an **LLM judge** or NLI model: 'is each claim supported?'",
      "Not supported? **Refuse** or say 'I don't know'",
      "Require **citations** to source chunks",
      "It adds latency: use it on **high-risk** answers"
    ]
  },
  {
    "id": "guard-prod-2",
    "term": "What **guardrails do tools and agents** need?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "**Allowlist** which tools can run",
      "**Validate arguments** before execution",
      "**Human approval** for write, delete, payment",
      "Set **max steps, timeouts and spend limits**",
      "Run with the **user's permissions**"
    ]
  },
  {
    "id": "guard-prod-3",
    "term": "The guard is **slow or down**. Fail open or closed?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "High risk (finance, health, tools): **fail closed**",
      "Low risk chatbot: **fail open** and raise an alert",
      "Always return a **safe refusal**, never a stack trace",
      "**Log the decision**, without raw PII"
    ]
  },
  {
    "id": "guard-prod-4",
    "term": "How should a **refusal message** look?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "Short, polite and **consistent**",
      "Do not reveal **rule details**: it helps attackers",
      "Offer a **safe alternative** ('I can help with...')",
      "Return a clear **HTTP status and error code**",
      "Log the real reason **internally**"
    ]
  },
  {
    "id": "guard-prod-5",
    "term": "How do you **test** guardrails?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "Build a **red-team set**: injections, jailbreaks, PII, toxic text",
      "Include **normal prompts** too",
      "Measure **false negatives** (missed attacks) and **false positives** (blocked good users)",
      "Run it in **CI** on every rule or model change",
      "Tools to try: **garak**, **promptfoo**"
    ]
  },
  {
    "id": "guard-prod-6",
    "term": "What do you **monitor** for guardrails in production?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "**Blocked count** by category and rule",
      "**Block rate** per tenant and per hour",
      "**Guard latency** (p95)",
      "Alert on **spikes**: it may be an attack",
      "Sample **blocked and passed** cases for review",
      "Feed findings back into **rules and tests**"
    ]
  },
  {
    "id": "guard-prod-7",
    "term": "How do you keep guardrail **latency and cost** low?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "Order checks: **cheap rules first**, model last",
      "Use a **small guard model**",
      "**Cache verdicts** for repeated inputs",
      "Run checks **in parallel**",
      "Use heavy checks only on **high-risk paths**",
      "Set a **latency budget** per request"
    ]
  },
  {
    "id": "guard-prod-8",
    "term": "Attackers **bypass your filter** with encoded or multilingual text. How do you harden it?",
    "tag": "6D · Guardrails: Production",
    "explain": [
      "**Normalize** first: unicode, case, spacing",
      "**Decode** base64, leetspeak and escapes",
      "Use a **multilingual guard model**, not only English regex",
      "Keep an **output guardrail** as a backstop",
      "Apply **least privilege**: a bypass then does little damage",
      "Add every bypass to the **red-team set**"
    ]
  },
  {
    "id": "security-1",
    "term": "Which **security layers** does a Java AI app need?",
    "tag": "7 · Security & Audit",
    "explain": [
      "**AuthN**: who is calling",
      "**AuthZ**: what they may access",
      "**Secrets**, **rate limits** and **audit logs**",
      "Tools: **Spring Security + OAuth2**, and **Vault**"
    ]
  },
  {
    "id": "security-2",
    "term": "How do you **authenticate** users and services?",
    "tag": "7 · Security & Audit",
    "explain": [
      "Users: Spring Security **OAuth2 Resource Server** checks a **JWT**",
      "Services: **client credentials** flow with **short-lived** tokens",
      "Pass **user and tenant claims** down to retrieval filters"
    ]
  },
  {
    "id": "security-3",
    "term": "Why use **HashiCorp Vault**?",
    "tag": "7 · Security & Audit",
    "explain": [
      "It keeps **DB passwords and API keys** out of code",
      "It issues **short-lived dynamic credentials**",
      "It supports **rotation** and keeps an **audit log**",
      "Java integration: **Spring Cloud Vault**"
    ]
  },
  {
    "id": "security-4",
    "term": "What are **TPM / RPM** limits, and how do you enforce them?",
    "tag": "7 · Security & Audit",
    "explain": [
      "**RPM**: requests per minute. **TPM**: tokens per minute",
      "Apply them per **user, tenant or API key**",
      "Count tokens with **JTokkit** or the response usage",
      "Share counters across pods with **Bucket4j + Redis**",
      "Return **429 + Retry-After**",
      "This protects **GPU capacity and budget**"
    ]
  },
  {
    "id": "security-5",
    "term": "How do you enforce **document-level access** in RAG?",
    "tag": "7 · Security & Audit",
    "explain": [
      "Store **ACL or tenant metadata** on every chunk",
      "**Filter at query time** by the caller's rights",
      "Never retrieve first and ask the model to hide it",
      "**Re-check** permissions on tool calls",
      "**Audit** who accessed what"
    ]
  },
  {
    "id": "security-6",
    "term": "What does **shielding embeddings from reverse-engineering** mean?",
    "tag": "7 · Security & Audit",
    "explain": [
      "**Embedding inversion** can rebuild approximate text from vectors",
      "So treat vectors as **sensitive as the source**",
      "**Encrypt** at rest and in transit; restrict DB access",
      "**Redact PII** before embedding",
      "Keep **raw prompts** out of audit logs"
    ]
  },
  {
    "id": "deploy-1",
    "term": "Why **Docker + Kubernetes** for an LLM app?",
    "tag": "8 · Deployment",
    "explain": [
      "**Docker**: a reproducible image",
      "**Kubernetes**: scaling, self-healing, rolling updates",
      "Run **Java API, model server and vector DB** as separate pods"
    ]
  },
  {
    "id": "deploy-2",
    "term": "How does a container get **GPU access**?",
    "tag": "8 · Deployment",
    "explain": [
      "The host needs the **NVIDIA driver** and **NVIDIA Container Toolkit**",
      "Docker: **--gpus all**",
      "Kubernetes: install the **NVIDIA device plugin**",
      "Then request **nvidia.com/gpu: 1** in the pod limits"
    ]
  },
  {
    "id": "deploy-3",
    "term": "What is **KServe**?",
    "tag": "8 · Deployment",
    "explain": [
      "Kubernetes-native **model serving**",
      "You deploy models as an **InferenceService**",
      "It gives **autoscaling** and **canary** rollouts",
      "One model: plain Deployment + Ollama is enough",
      "Many models: use **KServe**"
    ]
  },
  {
    "id": "deploy-4",
    "term": "Why is **autoscaling LLM pods** different?",
    "tag": "8 · Deployment",
    "explain": [
      "**CPU %** is a poor signal",
      "Use **GPU use, queue depth, tokens/sec**",
      "Export with **DCGM exporter to Prometheus**",
      "Scale with **HPA custom metrics** or **KEDA**",
      "Scale-up is slow (loading GBs of weights): keep **min replicas**"
    ]
  },
  {
    "id": "deploy-5",
    "term": "What are **service mesh route boundaries** used for?",
    "tag": "8 · Deployment",
    "explain": [
      "**Istio / Linkerd** add **mTLS** between services",
      "They control **retries, timeouts and canary routing**",
      "**NetworkPolicy**: only the Java API can reach the model server",
      "Central place for **authz and rate limits**"
    ]
  },
  {
    "id": "deploy-6",
    "term": "How do you **roll out a new model** safely?",
    "tag": "8 · Deployment",
    "explain": [
      "Version the **model and prompt together**",
      "**Canary** a small share of traffic",
      "Compare **quality and latency** with the old version",
      "Mark the pod ready only **after the model is loaded**",
      "Keep **rollback** ready"
    ]
  },
  {
    "id": "observability-1",
    "term": "Why is **LLM observability** different?",
    "tag": "9 · Observability",
    "explain": [
      "Outputs are **non-deterministic, slow and costly**",
      "You need to see **prompt, response, tokens, latency**",
      "Plain HTTP logs are **not enough**"
    ]
  },
  {
    "id": "observability-2",
    "term": "What are **OpenTelemetry** and **LangFuse**?",
    "tag": "9 · Observability",
    "explain": [
      "**OpenTelemetry**: vendor-neutral standard for **traces, metrics, logs**",
      "**LangFuse**: LLM-focused UI for **traces, prompts, cost, scores**",
      "Typical setup: Java emits **OTel**, a backend shows it"
    ]
  },
  {
    "id": "observability-3",
    "term": "What does one request **trace** look like?",
    "tag": "9 · Observability",
    "explain": [
      "Root **HTTP span**",
      "Then **guardrail, cache, embed, vector search, rerank, LLM call**",
      "Add attributes: **model, tokens in/out, top-k, tenant**",
      "Follow the OTel **GenAI semantic conventions**"
    ]
  },
  {
    "id": "observability-4",
    "term": "What is **TTFT**, and which other metrics matter?",
    "tag": "9 · Observability",
    "explain": [
      "**TTFT** = Time To First Token",
      "It is the delay the user **feels**",
      "Also track **total latency, tokens/sec, error rate, cache hit rate**",
      "With streaming, TTFT is **not** total latency"
    ]
  },
  {
    "id": "observability-5",
    "term": "How do you hook into model calls in Java?",
    "tag": "9 · Observability",
    "explain": [
      "LangChain4j: **ChatModelListener** (onRequest, onResponse, onError)",
      "Spring AI: built-in **Micrometer Observation**",
      "**Micrometer Tracing** bridges to OTel",
      "TTFT: start a timer at request, stop at the **first streamed token**"
    ]
  },
  {
    "id": "observability-6",
    "term": "What are the **privacy and cost** risks of logging prompts?",
    "tag": "9 · Observability",
    "explain": [
      "Prompts contain **PII**: redact them",
      "Set **retention** limits and **access control**",
      "**High-cardinality tags** (user id) break metrics: keep them in traces",
      "Use **trace sampling** to control volume"
    ]
  },
  {
    "id": "observability-7",
    "term": "Users say answers are **bad or slow**. How do you find the cause?",
    "tag": "9 · Observability",
    "explain": [
      "Find the trace by **request id**",
      "Look for the **slowest span**",
      "Slow part: **retrieval, LLM queue, or huge context**?",
      "For quality, compare **retrieved chunks vs answer**",
      "Link **user feedback** to the trace",
      "Alert on **p95 latency, TTFT, error rate, token spikes**"
    ]
  },
  {
    "id": "pipeline-1",
    "term": "Why run document ingestion **asynchronously**?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "Extract, chunk, embed and index are **slow and heavy**",
      "Never run them on the **request thread**",
      "Upload returns **202 Accepted** quickly",
      "**Kafka** decouples, buffers and retries"
    ]
  },
  {
    "id": "pipeline-2",
    "term": "What are the **stages** of an ingestion pipeline?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "Upload, then **raw docs topic**",
      "Extract text, **chunk**, **embed**",
      "**Upsert** into vector DB (and graph)",
      "Each stage is its own **consumer group**, scaled alone",
      "Publish **status events** for progress"
    ]
  },
  {
    "id": "pipeline-3",
    "term": "What does **Spring Cloud Stream** give you?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "**Functional style**: Consumer, Function, Supplier beans",
      "A **binder** hides Kafka details",
      "Bindings live in **config**",
      "Less boilerplate than raw **KafkaConsumer**"
    ]
  },
  {
    "id": "pipeline-4",
    "term": "How do you handle **failures, retries and duplicates**?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "Kafka is **at-least-once**, so duplicates happen",
      "Make consumers **idempotent**: upsert by **chunk id / content hash**",
      "**Retry with backoff**",
      "Poison messages go to a **DLQ**",
      "Commit offsets **only after** success"
    ]
  },
  {
    "id": "pipeline-5",
    "term": "How do **partitioning, ordering and backpressure** work?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "Key by **document id** to keep a document **ordered**",
      "Consumers in a group **cannot exceed partitions**",
      "Embedding is **GPU-bound**: limit concurrency and **batch**",
      "Tune **max.poll.records** for backpressure",
      "Big files go to **object storage**; send only a **reference**"
    ]
  },
  {
    "id": "pipeline-6",
    "term": "You change the **embedding model**. How do you re-index a million docs?",
    "tag": "10 · Async Pipelines",
    "explain": [
      "Old vectors become **invalid**",
      "Build a **new versioned index** in parallel",
      "**Backfill** through Kafka at low priority",
      "Switch an **alias** to the new index, then delete the old",
      "Store the **embedding model version** in metadata"
    ]
  },
  {
    "id": "eval-1",
    "term": "Why **evaluate** LLM / RAG apps?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "Outputs vary, so **assertEquals** does not work",
      "Evaluation catches **bad answers**",
      "It catches **regressions** after prompt, model or chunking changes"
    ]
  },
  {
    "id": "eval-2",
    "term": "Which **RAG metrics** does **Ragas** provide?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "**Faithfulness**: is the answer grounded in the context?",
      "**Answer relevancy**: does it answer the question?",
      "**Context precision / recall**: is retrieval good?",
      "This separates **retrieval** problems from **generation** problems"
    ]
  },
  {
    "id": "eval-3",
    "term": "What is a **golden dataset**?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "Curated **question + expected answer + source docs**",
      "Start with **50-100 real questions**",
      "Add **production failures** over time",
      "**Version it** in the repo"
    ]
  },
  {
    "id": "eval-4",
    "term": "What is **LLM-as-a-judge**, and what are its risks?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "Another LLM **scores answers** against a rubric",
      "Risks: **bias, cost, inconsistent scores**",
      "Use **temperature 0** and a **clear rubric**",
      "Prefer a **stronger judge** than the app model",
      "**Spot-check** with humans"
    ]
  },
  {
    "id": "eval-5",
    "term": "**Ragas is Python.** How do you use it from Java?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "Run it as a **separate eval job** in CI",
      "It calls your **Java endpoint**",
      "Or rewrite the judge prompts in Java with **LangChain4j**",
      "Java side: **JUnit** tests with **score thresholds**"
    ]
  },
  {
    "id": "eval-6",
    "term": "What is **drift**, and how do you catch **regressions** in CI?",
    "tag": "11 · Evaluation & Drift",
    "explain": [
      "Drift: quality changes after a new **model, prompt, data or chunking**",
      "Run the eval suite on **every PR**",
      "**Fail the build** if scores drop below the threshold",
      "Sample **production** and compare to a baseline",
      "**Pin model versions**"
    ]
  },
  {
    "id": "multimodal-1",
    "term": "What does **multi-modal** mean here?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "The model accepts **images**, not only text",
      "Example: **llava** on Ollama",
      "Uses: **screenshots, invoices, charts**"
    ]
  },
  {
    "id": "multimodal-2",
    "term": "How do you send an **image to Ollama** from Java?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "**Base64-encode** the image",
      "Put it in the message's **images** field",
      "LangChain4j: use **ImageContent** in a UserMessage",
      "**Resize first**: smaller image = faster"
    ]
  },
  {
    "id": "multimodal-3",
    "term": "What is **Spring WebFlux**, and why use it here?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "A **reactive, non-blocking** web stack (Netty)",
      "A few threads serve many **slow LLM calls**",
      "Handlers return **Mono / Flux**",
      "Stream tokens to the browser with **SSE**"
    ]
  },
  {
    "id": "multimodal-4",
    "term": "How do you accept **file uploads** without blocking?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "Read the upload as **FilePart** / **Flux of DataBuffer**",
      "Do not load the whole file into memory",
      "Set a **max size**",
      "Save to **object storage**, then process **async** (Kafka)"
    ]
  },
  {
    "id": "multimodal-5",
    "term": "PDF parsing (PDFBox) is **blocking**. What do you do?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "Never run it on the **event-loop thread**",
      "It would **freeze all requests**",
      "Wrap it in **Schedulers.boundedElastic()**",
      "Catch mistakes in tests with **BlockHound**",
      "Heavy jobs: move to a **Kafka worker**"
    ]
  },
  {
    "id": "multimodal-6",
    "term": "What is the **text vs image strategy** for PDFs, and what goes wrong?",
    "tag": "12 · Multi-Modal",
    "explain": [
      "**Digital PDF**: extract **text and tables**",
      "**Scanned PDF**: use **OCR** or a vision model per page",
      "Vision models are **slow and GPU-hungry**: cap **pages and concurrency**",
      "**Validate** file type and size (malicious files)",
      "Small local models **hallucinate** on dense pages"
    ]
  },
  {
    "id": "agentic-1",
    "term": "What is **function calling**?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "The model does **not run code**",
      "It outputs **which tool + arguments** (JSON)",
      "Your **Java code runs** the tool",
      "Then it returns the result to the model"
    ]
  },
  {
    "id": "agentic-2",
    "term": "What is the **tool-calling loop**?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "Send **messages + tool definitions**",
      "Model replies with a **tool call**",
      "Java **runs the method** and sends back the result",
      "Model writes the **final answer**",
      "The loop repeats if more tools are needed"
    ]
  },
  {
    "id": "agentic-3",
    "term": "How do you define tools in **LangChain4j**?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "Annotate a method with **@Tool**",
      "Describe parameters with **@P**",
      "Register with **.tools(object)** on the AI Service",
      "Spring AI also uses **@Tool**"
    ]
  },
  {
    "id": "agentic-4",
    "term": "What makes the model **pick the right tool**?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "A clear **name and description**",
      "Clear **parameter docs**",
      "**Few focused tools** beat many vague ones",
      "The model must **support tool calling**"
    ]
  },
  {
    "id": "agentic-5",
    "term": "**Agentic routing vs an intent router**: what is the difference?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "**Agentic**: the model picks the tool itself",
      "It is **flexible but less predictable**",
      "**Router**: a cheap classifier picks a **fixed path**",
      "It is **predictable and testable**",
      "Known paths: use a **router**. Open-ended: use an **agent**"
    ]
  },
  {
    "id": "agentic-6",
    "term": "What **safety controls** do tools need?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "**Least privilege**: read-only by default",
      "**Validate arguments**; never build SQL from model output",
      "**Human approval** for write, delete, payment",
      "Set **max iterations and timeouts** to stop loops",
      "Run as the **user**, not a powerful service account"
    ]
  },
  {
    "id": "agentic-7",
    "term": "A tool **fails**, or the model **invents** a tool call. How do you handle it?",
    "tag": "13 · Agentic Routing",
    "explain": [
      "Return the **error as the tool result**",
      "The model can then **correct itself**",
      "Reject **unknown tool names**",
      "Use **idempotency keys** so retries do not repeat side effects",
      "**Trace** every tool call",
      "Cap steps and have a **fallback answer**"
    ]
  },
  {
    "id": "cdc-1",
    "term": "What is **CDC (Change Data Capture)**?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "It reads **inserts, updates, deletes** from the DB **log**",
      "It publishes them as **events**",
      "Downstream stores stay **in sync** automatically"
    ]
  },
  {
    "id": "cdc-2",
    "term": "Why **CDC** instead of dual writes or nightly batch?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "**Dual write**: one side can fail, data becomes **inconsistent**",
      "**Batch**: data is **stale** and the job is heavy",
      "**CDC**: **near real-time**, ordered, **no app code change**"
    ]
  },
  {
    "id": "cdc-3",
    "term": "How do **Debezium** and **Kafka Connect** work together?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "Debezium is a **source connector** on Kafka Connect",
      "It reads the Postgres **WAL** (or MySQL **binlog**)",
      "It publishes **before/after + operation** per table topic",
      "First an **initial snapshot**, then streaming"
    ]
  },
  {
    "id": "cdc-4",
    "term": "How does a **table change** reach the **vector and graph** stores?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "Debezium publishes to **Kafka**",
      "A consumer **re-chunks and re-embeds** the changed row",
      "It **upserts** the vector DB and updates **graph nodes and edges**",
      "Skip re-embedding if the **content hash** is unchanged"
    ]
  },
  {
    "id": "cdc-5",
    "term": "What are the traps with **updates and deletes**?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "A **delete** must remove the **vectors** too",
      "Handle **op 'd'** and **tombstones**",
      "An **update**: delete old chunks by source id, insert new ones",
      "Use **stable ids** (source id + chunk index)",
      "**Partition by primary key** to keep order"
    ]
  },
  {
    "id": "cdc-6",
    "term": "What are the **operational risks** of CDC?",
    "tag": "14 · Data Sync (CDC)",
    "explain": [
      "An unread **replication slot** makes **WAL grow** and fill the disk",
      "**Schema changes** can break consumers: use **Schema Registry**",
      "Watch **lag**: data is **eventually consistent**",
      "Plan the **initial snapshot** for big tables"
    ]
  },
  {
    "id": "context-1",
    "term": "What is the **context window**, and why count tokens?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "It is the max tokens the model can read",
      "It covers **prompt + history + retrieved text + output**",
      "Over the limit: **silent truncation** or an error"
    ]
  },
  {
    "id": "context-2",
    "term": "What is **JTokkit**, and how accurate is it?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "A Java **tokenizer** library (OpenAI encodings)",
      "Count tokens **before** you send",
      "It is only **approximate** for Llama and other models",
      "Keep a **safety margin**",
      "Ollama returns exact counts: **prompt_eval_count**, **eval_count**"
    ]
  },
  {
    "id": "context-3",
    "term": "What is a **sliding window**?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "Keep the **latest N messages or tokens**",
      "Drop the **oldest** first",
      "Always keep the **system prompt**",
      "Better: **summarize** old turns"
    ]
  },
  {
    "id": "context-4",
    "term": "How do you **budget a prompt**?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "Budget = **context size - reserved output tokens**",
      "Split it: **system, history, chunks, question**",
      "Trim chunks by **score** until it fits",
      "Set Ollama **num_ctx** high enough: small defaults **silently truncate**"
    ]
  },
  {
    "id": "context-5",
    "term": "How do you track tokens with **Micrometer MeterRegistry**?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "Use a **Counter** like **llm.tokens**",
      "Tag it with **type (input/output), model, tenant**",
      "Add a **Timer** for latency",
      "Export to **Prometheus / Grafana**",
      "Avoid **high-cardinality** tags like user id"
    ]
  },
  {
    "id": "context-6",
    "term": "How do you **cross-charge GPU cost** to tenants?",
    "tag": "15 · Context & Accounting",
    "explain": [
      "Cost per token = **GPU hourly cost / token throughput**",
      "Tenant bill = **tokens used x cost per token**",
      "Measure **GPU-seconds** if you can",
      "Add **quotas and budget alerts**",
      "Ties to **TPM limits** (component 7)"
    ]
  },
  {
    "id": "simd-1",
    "term": "What is **SIMD**?",
    "tag": "16 · Hardware Math",
    "explain": [
      "**One CPU instruction works on many values**",
      "It uses a wide **vector register**",
      "Perfect for loops over **float arrays** like embeddings"
    ]
  },
  {
    "id": "simd-2",
    "term": "What is the **Java Vector API**, and what is **JEP 508**?",
    "tag": "16 · Hardware Math",
    "explain": [
      "An API in **jdk.incubator.vector** for SIMD code",
      "**JEP 508** is its **tenth incubator** (JDK 25)",
      "Still **incubating**: the API can change",
      "Run with **--add-modules jdk.incubator.vector**"
    ]
  },
  {
    "id": "simd-3",
    "term": "Why do embeddings need it?",
    "tag": "16 · Hardware Math",
    "explain": [
      "Cosine or dot product over **768-1536 floats**",
      "Repeated for **millions** of vectors",
      "Scalar loop: **one float per step**",
      "Vector API: **8-16 floats per step**"
    ]
  },
  {
    "id": "simd-4",
    "term": "How does a **dot product** look with the Vector API?",
    "tag": "16 · Hardware Math",
    "explain": [
      "**SPECIES = FloatVector.SPECIES_PREFERRED**",
      "Loop in steps of **SPECIES.length()**",
      "Load a and b, then **acc = a.fma(b, acc)**",
      "End with **reduceLanes(ADD)**",
      "Handle leftovers with a **scalar tail loop**"
    ]
  },
  {
    "id": "simd-5",
    "term": "Why not trust **JIT auto-vectorization**?",
    "tag": "16 · Hardware Math",
    "explain": [
      "C2 vectorizes **simple loops**, not all of them",
      "**Float reductions** often fail: strict FP order",
      "The explicit API gives **control**",
      "Always **verify with JMH**"
    ]
  },
  {
    "id": "simd-6",
    "term": "When do you use it, and when not?",
    "tag": "16 · Hardware Math",
    "explain": [
      "Use it for **in-JVM similarity, re-scoring, reranking**",
      "Skip it if **pgvector** already runs the ANN search",
      "Use a **GPU** for very large batches",
      "Costs: **incubator flag, portability, tail handling**",
      "**Normalize vectors** so dot product = cosine; **benchmark vs scalar**"
    ]
  }
];
