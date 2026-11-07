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

// Study notes: how the 124 cards connect (theme = the kitchen, same 5 stations in every deck)
(window.NOTES = window.NOTES || {}).javaai = {
  theme: {
    emoji: "🏪",
    name: "The Restaurant at Scale",
    pitch: "**Java is the restaurant manager.** Ollama is the **stove**, LangChain4j the **order desk**, Kafka the **delivery belt**, vector/graph stores the **pantry**, and guardrails the **health inspector**."
  },
  chain: "Stove + order desk + deliveries (**1, 2, 14, 10**) → pantry (**3, 4, 12**) → cook an order (**13, 15, 5, 16**) → open the doors (**8**) → inspect (**7, 6A-D, 9, 11**)",
  stations: [
    {
      id: "source", role: "The stove, the order desk and the deliveries",
      sections: [
        {
          title: "1 · LLM Runtime: the stove", tags: ["1 · LLM Runtime"],
          bullets: [
            "**Ollama** runs open models in-house: **REST API on 11434**, data stays inside, **no per-token bill**",
            "**/generate** = one prompt, no history. **/chat** = messages with roles",
            "**NUM_PARALLEL** = requests at once; each slot needs its own **KV cache** (VRAM). **GPU layer offload**: layers that do not fit run on CPU (slow)",
            "Predictable latency: **KEEP_ALIVE** + warm-up (no cold start), cap **num_ctx** and output. Protect a shared box: **semaphore, timeout, circuit breaker, fallback**"
          ],
          next: "A stove is raw power. You need an order desk to talk to it → **Orchestration**"
        },
        {
          title: "2 · Orchestration: the order desk", tags: ["2 · Orchestration"],
          bullets: [
            "**LangChain4j / Spring AI** = one API for prompts, models, memory, tools, RAG (swap providers by config)",
            "An **AI Service** is a plain Java interface; the framework builds it. Return a **record** and the reply is parsed into it",
            "LLMs are stateless, so **ChatMemory** re-sends history, and it must be **per user** and thread-safe",
            "Harden: separate system rules from user text (anti-injection); for flaky structured output use **temperature 0** and **JSON schema**"
          ],
          next: "The desk needs fresh knowledge from the database → **CDC**"
        },
        {
          title: "14 · Data Sync (CDC): deliveries", tags: ["14 · Data Sync (CDC)"],
          bullets: [
            "**CDC** reads the DB log and publishes every insert, update and delete as an event",
            "Better than **dual writes** (can diverge) or **nightly batch** (stale)",
            "**Debezium on Kafka Connect** → topic → consumer **re-chunks and re-embeds** → upserts vector and graph stores",
            "Traps: a **delete must remove vectors**; an unread replication slot can fill the disk; schema changes need a **Schema Registry**"
          ],
          next: "Events flow in. Handle them without blocking anyone → **Async pipelines**"
        },
        {
          title: "10 · Async Pipelines: the conveyor belt", tags: ["10 · Async Pipelines"],
          bullets: [
            "Ingestion is slow, so **never on the request thread**: upload returns **202 Accepted**",
            "Stages: **upload → extract → chunk → embed → upsert**, via **Spring Cloud Stream** (functional beans + binder)",
            "Kafka is **at-least-once** → make consumers **idempotent**; retry with backoff; key by **doc id** to keep order",
            "**Change the embedding model?** Build a new versioned index in parallel and backfill at low priority"
          ],
          next: "The belt carries chunks to the pantry → **Vector Search**"
        }
      ]
    },
    {
      id: "prep", role: "Stock the pantry so any ingredient is found fast",
      sections: [
        {
          title: "3 · Vector Search: the shelf", tags: ["3 · Vector Search"],
          bullets: [
            "Stores embeddings and returns the **top-k nearest chunks** with metadata. **pgvector** (inside Postgres: SQL, ACID) vs **ChromaDB** (quick prototypes)",
            "Operators: **<=>** cosine, **<->** L2, **<#>** inner product. **HikariCP** pooling matters because vector queries are heavy",
            "**HNSW** (best recall, more memory) vs **IVFFlat** (fast build, small)",
            "**Multi-tenant**: always filter by **tenant_id from the JWT**. Slow or low recall? **EXPLAIN ANALYZE**, tune **ef_search / probes**"
          ],
          next: "Similar text is not the same as connected facts → **Knowledge Graph**"
        },
        {
          title: "4 · Knowledge Graph: the connections", tags: ["4 · Knowledge Graph"],
          bullets: [
            "Vectors find **similar text**; a graph answers **how things connect** (nodes + relationships)",
            "**Neo4j** (Cypher, easy) vs **JanusGraph** (Gremlin, huge distributed)",
            "Build queries with **parameters**, never string concatenation (**query injection**)",
            "**GraphRAG**: vector search finds start entities → expand **1-2 hops** → turn the subgraph into short facts. Limit depth, use LIMIT, watch **supernodes**"
          ],
          next: "Pantry items are not only text → **Multi-Modal**"
        },
        {
          title: "12 · Multi-Modal: images and PDFs", tags: ["12 · Multi-Modal"],
          bullets: [
            "Vision models (e.g. **llava** on Ollama) accept images: send **base64** (LangChain4j: **ImageContent**)",
            "**WebFlux** (non-blocking, Netty) lets few threads serve many slow LLM calls; stream uploads, never load whole files",
            "**PDFBox is blocking** → run it on **boundedElastic**, never on the event loop",
            "Digital PDF = extract text; scanned PDF = **OCR / vision per page**. Vision is slow, so cap pages and concurrency"
          ],
          next: "Pantry ready. An order comes in → **Cook**"
        }
      ]
    },
    {
      id: "cook", role: "One order: route it, fit it, reuse it, compute fast",
      sections: [
        {
          title: "13 · Agentic Routing: pick the tool", tags: ["13 · Agentic Routing"],
          bullets: [
            "**Function calling**: the model outputs **tool + args**, and **your Java runs it**. The **tool loop** repeats until done",
            "Define tools with **@Tool** and **@P**. Clear names and descriptions, and **few focused tools**, make the model choose well",
            "**Agentic routing** (model decides, flexible) vs **intent router** (cheap classifier, predictable)",
            "Safety: **least privilege**, validate args, human approval for write/delete/pay. On failure, **return the error as the result** and reject unknown tools"
          ],
          next: "Every tool result and chunk takes space in the prompt → **Context & Accounting**"
        },
        {
          title: "15 · Context & Accounting: fit and count", tags: ["15 · Context & Accounting"],
          bullets: [
            "Context window = **prompt + history + chunks + output**. Over the limit = truncation or error",
            "**JTokkit** counts tokens before you send (approximate for non-OpenAI models)",
            "**Sliding window** drops the oldest turns but keeps the system prompt. **Budget** = context − reserved output, split across parts",
            "Count with **Micrometer** (Counter by type/model/tenant). **Cross-charge** tenants: GPU cost per hour ÷ tokens per hour"
          ],
          next: "Repeated questions waste all of this work → **Semantic Cache**"
        },
        {
          title: "5 · Semantic Cache: the pre-made dish", tags: ["5 · Semantic Cache"],
          bullets: [
            "Cache keyed by **meaning**: 'reset my password' ≈ 'change my password'. Flow: **embed query → nearest cached query in Redis → close enough? return it**",
            "**Exact** cache is safe but rarely hits; **semantic** hits more but can be wrong",
            "**Threshold**: too loose = wrong answers, too strict = no savings",
            "Do not cache **personal, time-sensitive or tool** answers; key by **tenant**; set a **TTL**; fall back to the LLM if Redis is down"
          ],
          next: "For cache misses, the cost of each comparison matters → **Hardware Math**"
        },
        {
          title: "16 · Hardware Math: speed in the JVM", tags: ["16 · Hardware Math"],
          bullets: [
            "**SIMD** = one CPU instruction on many numbers: perfect for embeddings (768-1536 floats)",
            "**Java Vector API** (jdk.incubator.vector, **JEP 508**, still incubating) gives explicit control; auto-vectorization often fails on float reductions",
            "Use it for **in-JVM similarity, re-scoring, reranking**. Skip it if pgvector already does the search; use a GPU for very large batches"
          ],
          next: "The dish is made. Open the doors → **Deployment**"
        }
      ]
    },
    {
      id: "serve", role: "Open the doors to real traffic",
      sections: [
        {
          title: "8 · Deployment", tags: ["8 · Deployment"],
          bullets: [
            "**Docker** = reproducible image; **Kubernetes** = scale, self-heal, rolling updates. Java API, model server and vector DB are **separate pods**",
            "GPU access: **NVIDIA driver + Container Toolkit**, then **--gpus all** or the **device plugin**",
            "**KServe** serves models as an **InferenceService** with autoscaling and canary",
            "Autoscale on **GPU use, queue depth, tokens/sec**, not CPU. **Service mesh** gives mTLS and route control; roll out **model + prompt versions** by canary"
          ],
          next: "Open doors mean strangers → **Security**"
        }
      ]
    },
    {
      id: "inspect", role: "Security, guardrails, tracing and grading",
      sections: [
        {
          title: "7 · Security & Audit: locks", tags: ["7 · Security & Audit"],
          bullets: [
            "**AuthN** (who) → **AuthZ** (what) → secrets → rate limits → audit",
            "Users: **JWT via OAuth2**; services: **client credentials**. **Vault** keeps secrets out of code with short-lived credentials",
            "**RPM / TPM limits** per user/tenant. **Document-level access**: store ACL on every chunk and **filter at query time**",
            "**Embeddings can be inverted** into text, so treat vectors as sensitive as the source"
          ],
          next: "Locks do not stop clever text. Add guardrails → **6A**"
        },
        {
          title: "6A · Guardrails: Basics", tags: ["6A · Guardrails: Basics"],
          bullets: [
            "Guardrails = checks **before (input)** and **after (output)** the call, because LLMs are probabilistic",
            "Flow: **input guard → context guard → LLM → output guard**. **Rules** are fast and cheap but bypassable; **models** (Llama Guard) catch more",
            "A **system prompt is not a guardrail** (it can be ignored). Use **defence in depth**: auth → rules → model → output checks",
            "Risk list: **OWASP LLM Top 10** (injection, disclosure, improper output handling)"
          ],
          next: "Which attacks exactly? → **6B**"
        },
        {
          title: "6B · Guardrails: Attacks & Defence", tags: ["6B · Guardrails: Attacks & Defence"],
          bullets: [
            "**Prompt injection**: the LLM cannot separate instructions from data. **Direct** (user types it) vs **indirect** (hidden in docs, pages, tool output)",
            "**Jailbreak** attacks the **model's** rules; **injection** attacks the **app's** task",
            "**System prompt leakage**: assume it leaks, so never store secrets there",
            "Defend: normalize then detect; treat every **retrieved chunk as untrusted data**; treat **model output as untrusted input** (no SQL/HTML/shell from it)"
          ],
          next: "Now write it in Java → **6C**"
        },
        {
          title: "6C · Guardrails: Java Implementation", tags: ["6C · Guardrails: Java Implementation"],
          bullets: [
            "**LangChain4j**: **InputGuardrail / OutputGuardrail** on the AI Service. **Spring AI**: **Advisors** (before/after)",
            "Output guard can **pass, block with a safe message, or retry**",
            "**PII**: detect (regex / NER / Presidio) then **redact or tokenize** before the LLM and in logs",
            "**Llama Guard** via Ollama for model-based checks. Keep them **non-blocking** (parallel checks, virtual threads). Validate structured output with **Bean Validation**"
          ],
          next: "It works on a laptop. Does it survive production? → **6D**"
        },
        {
          title: "6D · Guardrails: Production", tags: ["6D · Guardrails: Production"],
          bullets: [
            "Check **groundedness** against retrieved context; tools and agents need **allowlists, arg validation, approvals**",
            "Guard slow or down? **High risk fails closed, low risk fails open + alert**. Refusals are **short, polite, reveal no rules**",
            "Test with a **red-team set** (measure false negatives and false positives); monitor **blocks by category, p95 latency**",
            "Keep it cheap: **cheap rules first, small model last, cache verdicts**. Beat bypass with **normalization, decoding, multilingual** guard models"
          ],
          next: "You cannot fix what you cannot see → **Observability**"
        },
        {
          title: "9 · Observability: cameras", tags: ["9 · Observability"],
          bullets: [
            "LLM output is non-deterministic, slow, costly, so log **prompt, response, tokens, latency**",
            "**OpenTelemetry** (standard) + **LangFuse** (LLM UI). One trace: **HTTP → guardrail → cache → embed → search → rerank → LLM**",
            "Key metric **TTFT** (time to first token), plus total latency, tokens/sec, errors, cache hit rate",
            "Java hooks: **ChatModelListener**, Spring AI **Micrometer**. Redact PII in logs; keep high-cardinality ids in traces, not metrics",
            "'Answers are bad/slow' → find the trace → slowest span: **retrieval, LLM queue or huge context?**"
          ],
          next: "Traces say where; evaluation says how good → **Evaluation & Drift**"
        },
        {
          title: "11 · Evaluation & Drift: grades", tags: ["11 · Evaluation & Drift"],
          bullets: [
            "**assertEquals** fails on varying text, so use **metrics**: Ragas **faithfulness, answer relevancy, context precision/recall**",
            "A **golden dataset** (start with 50-100 real questions, add production failures). **LLM-as-a-judge** is useful but has bias and cost",
            "Ragas is Python, so run it as a **separate CI job** against your endpoint",
            "**Drift** (new model, prompt, data, chunking) is caught by running evals on **every PR** and failing under the threshold"
          ],
          next: "Failures become new golden questions → the whole restaurant improves"
        }
      ]
    }
  ]
};

// Extra detail per card + a link to related cards (shown under each answer)
(window.MORE = window.MORE || {}).javaai = {
  "runtime-1": ["Trade-off: you own the GPUs, patching and capacity planning", "🔗 Two ways to call it: **/generate vs /chat**"],
  "runtime-2": ["Use /chat for anything with history or tools; /generate for one-shot tasks", "🔗 Concurrency: **OLLAMA_NUM_PARALLEL**"],
  "runtime-3": ["Raising it helps throughput but shrinks the memory left for each request", "🔗 Where the model lives: **GPU layer offloading**"],
  "runtime-4": ["Partial offload works, but every CPU layer slows each token", "🔗 Smooth speed: **Predictable latency**"],
  "runtime-5": ["Measure p95 and p99, not the average, because queues hide in the tail", "🔗 Many users: **Protecting a shared Ollama box**"],
  "runtime-6": ["Reject early with a clear 429 rather than letting requests time out silently", "🔗 Talk to it with **LangChain4j / Spring AI**"],
  "orchestration-1": ["Keep business logic in your code and only prompts and tools in the framework layer", "🔗 Core building block: **AI Service**"],
  "orchestration-2": ["Interfaces are easy to mock in unit tests", "🔗 Typed answers: **Mapping text to a Java record**"],
  "orchestration-3": ["Add descriptions to record fields so the model knows what each means", "🔗 Remembering: **ChatMemory**"],
  "orchestration-4": ["Store memory in Redis or a DB when you run more than one instance", "🔗 At scale: **Thread-safe chat memory**"],
  "orchestration-5": ["Evict inactive conversations with a TTL to avoid memory leaks", "🔗 Safety of prompts: **Prompt structure vs injection**"],
  "orchestration-6": ["Never put secrets or hidden rules where users can ask for them", "🔗 Reliability: **Hardening structured output**"],
  "orchestration-7": ["Retry once with the parser error as feedback, then fail safe", "🔗 Retrieval step: **Vector search engine in RAG**"],
  "vector-1": ["Quality depends on chunking and the embedding model more than on the database", "🔗 Picking one: **pgvector vs ChromaDB**"],
  "vector-2": ["Hybrid needs (SQL joins, transactions) favour pgvector", "🔗 Query syntax: **Distance operators**"],
  "vector-3": ["Use the operator that matches the index operator class, or the index is ignored", "🔗 Connections: **Pooling for vector queries**"],
  "vector-4": ["Size the pool to what Postgres can handle, not to your thread count", "🔗 Index choice: **HNSW vs IVFFlat**"],
  "vector-5": ["HNSW suits changing data; IVFFlat needs data present to build good clusters", "🔗 Many customers: **Multi-tenant filtering**"],
  "vector-6": ["Test with your largest tenant and your smallest tenant", "🔗 When it breaks: **Troubleshooting slow search**"],
  "vector-7": ["Compare against exact search to measure the recall loss", "🔗 Beyond text similarity: **Knowledge graph**"],
  "graph-1": ["Great for 'who reports to whom', dependencies and multi-hop questions", "🔗 Choosing a product: **Neo4j vs JanusGraph**"],
  "graph-2": ["Start with Neo4j unless you truly need distributed scale", "🔗 Query language: **Cypher from Java**"],
  "graph-3": ["Read queries use read transactions; keep write transactions short", "🔗 Safe building: **Runtime queries**"],
  "graph-4": ["Allow-list labels and relationship types if they come from the model", "🔗 Using results: **GraphRAG**"],
  "graph-5": ["Keep the subgraph small: a short list of facts beats a huge dump", "🔗 Performance: **Slow or huge traversals**"],
  "graph-6": ["Add indexes on the properties used to find start nodes", "🔗 Saving repeated work: **Semantic cache**"],
  "cache-1": ["A hit skips embedding search, reranking and the LLM call", "🔗 Steps: **Semantic cache flow**"],
  "cache-2": ["Store the answer with the question embedding, tenant and timestamp", "🔗 Compare: **Exact vs semantic cache**"],
  "cache-3": ["A good setup checks exact first, then semantic", "🔗 Tuning: **Similarity threshold**"],
  "cache-4": ["Tune on real question pairs, and review near-threshold hits by hand", "🔗 Limits: **What not to cache**"],
  "cache-5": ["Invalidate by version when the source documents change", "🔗 Infrastructure: **Redis vector index**"],
  "cache-6": ["Treat the cache as optional: if Redis fails, go straight to the LLM", "🔗 Protection layers: **Guardrails basics**"],
  "guard-basics-1": ["Guardrails reduce risk; they never remove it completely", "🔗 Placement: **Where guardrails sit**"],
  "guard-basics-2": ["Check retrieved text too, not only the user prompt", "🔗 Two types: **Input vs output guardrails**"],
  "guard-basics-3": ["Output checks catch what slipped past input checks", "🔗 Methods: **Rule-based vs model-based**"],
  "guard-basics-4": ["Combine both: rules for the obvious, models for the subtle", "🔗 Threat list: **OWASP LLM Top 10**"],
  "guard-basics-5": ["Use the list as a checklist for your threat model", "🔗 Common mistake: **System prompt is not a guardrail**"],
  "guard-basics-6": ["Enforce rules in code outside the model", "🔗 Layers: **Defence in depth**"],
  "guard-basics-7": ["If one layer fails, the next still protects", "🔗 Meet the attack: **Prompt injection**"],
  "guard-attacks-1": ["It is the top-ranked LLM risk in OWASP's list", "🔗 Types: **Direct vs indirect**"],
  "guard-attacks-2": ["Indirect attacks scale: one poisoned page can hit every user", "🔗 Related: **Jailbreak vs injection**"],
  "guard-attacks-3": ["Different attack, different defence: model safety vs app design", "🔗 Info leak: **System prompt leakage**"],
  "guard-attacks-4": ["Detect leaks by planting a canary string in the prompt", "🔗 Spotting attacks: **Detecting injection**"],
  "guard-attacks-5": ["Detection is probabilistic; pair it with limited permissions", "🔗 RAG angle: **Defending RAG from indirect injection**"],
  "guard-attacks-6": ["Never let retrieved text decide which tool to call", "🔗 Output side: **Improper output handling**"],
  "guard-attacks-7": ["Escape for the destination: HTML encode for pages, parameters for SQL", "🔗 Build it: **LangChain4j guardrails**"],
  "guard-java-1": ["Guardrails can be unit-tested like any other class", "🔗 Example: **Simple input guardrail**"],
  "guard-java-2": ["Return a clear failure reason for logs but a safe message for users", "🔗 After the call: **Output guardrail actions**"],
  "guard-java-3": ["Retry is useful for format errors; block is better for unsafe content", "🔗 Other framework: **Spring AI advisors**"],
  "guard-java-4": ["Advisors run in order, so put cheap checks first", "🔗 Sensitive data: **PII handling**"],
  "guard-java-5": ["Test with real-looking samples in several formats and languages", "🔗 Model-based: **Llama Guard from Java**"],
  "guard-java-6": ["Run the guard model on a separate small instance to keep latency low", "🔗 Speed: **Non-blocking guardrails**"],
  "guard-java-7": ["Virtual threads make parallel checks cheap in Java 21+", "🔗 Format safety: **Validating structured output**"],
  "guard-java-8": ["Reject out-of-range values instead of silently fixing them", "🔗 Truthfulness: **Groundedness check**"],
  "guard-prod-1": ["Use a lower-cost judge model for this check", "🔗 Agents: **Tool and agent guardrails**"],
  "guard-prod-2": ["Log every tool call with user, arguments and result", "🔗 Failure policy: **Fail open or closed**"],
  "guard-prod-3": ["Set an explicit timeout for the guard so it cannot hang requests", "🔗 User message: **Refusal wording**"],
  "guard-prod-4": ["Log the real reason internally while showing a generic message", "🔗 Quality: **Testing guardrails**"],
  "guard-prod-5": ["Run the red-team set in CI on every guardrail or prompt change", "🔗 Live: **Monitoring guardrails**"],
  "guard-prod-6": ["A sudden spike in blocks can signal an attack or a broken rule", "🔗 Efficiency: **Latency and cost of guardrails**"],
  "guard-prod-7": ["Skip model-based checks for trusted internal tools if risk allows", "🔗 Hard case: **Encoded and multilingual bypass**"],
  "guard-prod-8": ["Re-check after decoding, since attacks can hide in layers", "🔗 Wider security: **Java AI security layers**"],
  "security-1": ["Security is layered: network, identity, data, model, and output", "🔗 Identity: **Authenticating users and services**"],
  "security-2": ["Validate issuer, audience and expiry on every JWT", "🔗 Secrets: **HashiCorp Vault**"],
  "security-3": ["Rotate credentials automatically so leaks have a short life", "🔗 Abuse control: **TPM / RPM limits**"],
  "security-4": ["Token limits stop one tenant from using all the GPU", "🔗 Data access: **Document-level access**"],
  "security-5": ["Test with two users that must not see each other's documents", "🔗 Data theft: **Shielding embeddings**"],
  "security-6": ["Use separate collections or encryption for highly sensitive tenants", "🔗 Shipping it: **Docker + Kubernetes**"],
  "deploy-1": ["Separate pods let you scale the model server independently of the API", "🔗 GPU in containers: **GPU access**"],
  "deploy-2": ["Use node labels or taints so only GPU workloads land on GPU nodes", "🔗 Serving layer: **KServe**"],
  "deploy-3": ["Gives standard routes, scale-to-zero options and canary traffic splits", "🔗 Scaling: **Autoscaling LLM pods**"],
  "deploy-4": ["Model load time is long, so keep a minimum number of warm replicas", "🔗 Traffic control: **Service mesh boundaries**"],
  "deploy-5": ["Mesh policies add zero-trust: only allowed callers reach the model", "🔗 Safe releases: **Rolling out a new model**"],
  "deploy-6": ["Keep an instant rollback path to the previous model and prompt", "🔗 Seeing inside: **LLM observability**"],
  "observability-1": ["Add quality signals (user feedback, eval scores) to usual latency and error metrics", "🔗 Tools: **OpenTelemetry and LangFuse**"],
  "observability-2": ["Use the same trace id across the Java API, vector DB call and LLM call", "🔗 Picture: **One request trace**"],
  "observability-3": ["Spans show exactly where time and tokens go", "🔗 Key metric: **TTFT**"],
  "observability-4": ["Stream tokens: TTFT stays low even when total time is long", "🔗 Code hooks: **Model call hooks in Java**"],
  "observability-5": ["Record model name, token counts and finish reason on each call", "🔗 Risk: **Privacy and cost of logging**"],
  "observability-6": ["Sample full prompts at a low rate, and log only metadata for the rest", "🔗 Debugging: **Bad or slow answers**"],
  "observability-7": ["Compare a good and a bad trace side by side", "🔗 Async ingestion: **Why async pipelines**"],
  "pipeline-1": ["Users get a job id and can poll status or get a webhook", "🔗 Steps: **Ingestion stages**"],
  "pipeline-2": ["Each stage as its own consumer lets you scale slow stages separately", "🔗 Tooling: **Spring Cloud Stream**"],
  "pipeline-3": ["Swapping Kafka for RabbitMQ is mostly a config change", "🔗 Reliability: **Failures, retries, duplicates**"],
  "pipeline-4": ["Send poison messages to a dead-letter topic after a few retries", "🔗 Scaling: **Partitioning, ordering, backpressure**"],
  "pipeline-5": ["More partitions mean more parallelism but weaker global ordering", "🔗 Changing models: **Re-index a million docs**"],
  "pipeline-6": ["Switch an alias to the new index only after quality checks pass", "🔗 Measuring: **Why evaluate**"],
  "eval-1": ["Run evaluation before launch, in CI, and on sampled production traffic", "🔗 Metrics: **Ragas**"],
  "eval-2": ["Each metric points to a different component: retrieval or generation", "🔗 Test data: **Golden dataset**"],
  "eval-3": ["Version the dataset like code and review changes", "🔗 Scoring: **LLM-as-a-judge**"],
  "eval-4": ["Use a different, stronger model as judge than the one being tested", "🔗 Tools: **Using Ragas from Java**"],
  "eval-5": ["Keep the eval service outside the main app so it cannot affect users", "🔗 Regressions: **Drift and CI**"],
  "eval-6": ["Track scores over time to see slow decay, not only sudden drops", "🔗 Beyond text: **Multi-modal**"],
  "multimodal-1": ["Image input uses far more tokens and compute than plain text", "🔗 How: **Sending an image to Ollama**"],
  "multimodal-2": ["Resize large images first to save tokens and time", "🔗 Web stack: **Spring WebFlux**"],
  "multimodal-3": ["Never call blocking code inside a reactive chain", "🔗 Uploads: **Non-blocking file uploads**"],
  "multimodal-4": ["Validate file type and size before processing", "🔗 Parsing: **PDFBox is blocking**"],
  "multimodal-5": ["Use a bounded thread pool so heavy PDFs cannot starve other work", "🔗 Choosing: **Text vs image strategy for PDFs**"],
  "multimodal-6": ["Use text extraction first and fall back to vision only for pages that need it", "🔗 Acting: **Function calling**"],
  "agentic-1": ["Tool names, descriptions and argument schemas are part of the prompt", "🔗 Flow: **Tool-calling loop**"],
  "agentic-2": ["Cap the number of loop rounds to stop endless tool calls", "🔗 Code: **Defining tools in LangChain4j**"],
  "agentic-3": ["Return small, structured results to save tokens", "🔗 Quality: **Making the model pick the right tool**"],
  "agentic-4": ["If two tools overlap, merge them or explain the difference", "🔗 Design: **Agentic routing vs intent router**"],
  "agentic-5": ["A hybrid is common: router for known intents, agent for the rest", "🔗 Controls: **Safety for tools**"],
  "agentic-6": ["Audit every call with user id, tool and arguments", "🔗 Errors: **Failed or invented tool calls**"],
  "agentic-7": ["Count failures and alert when the rate rises", "🔗 Data freshness: **CDC**"],
  "cdc-1": ["CDC reads the transaction log, so it adds almost no load to the app", "🔗 Why: **CDC vs dual writes or batch**"],
  "cdc-2": ["Dual writes cannot be atomic across two systems", "🔗 Tooling: **Debezium and Kafka Connect**"],
  "cdc-3": ["Events include the old and new row, useful for diff-based updates", "🔗 Path: **From table change to vector and graph**"],
  "cdc-4": ["Re-embed only changed fields to save GPU time", "🔗 Traps: **Updates and deletes**"],
  "cdc-5": ["Soft deletes still need filtering in the vector store", "🔗 Risks: **Operational risks of CDC**"],
  "cdc-6": ["Monitor consumer lag and replication slot size", "🔗 Limits: **Context window and tokens**"],
  "context-1": ["Count before sending, so you control what gets dropped", "🔗 Tool: **JTokkit**"],
  "context-2": ["Add a safety margin because counts for non-OpenAI models are estimates", "🔗 History: **Sliding window**"],
  "context-3": ["Summarise dropped turns into a short note instead of losing them", "🔗 Plan: **Prompt budgeting**"],
  "context-4": ["Put a hard ceiling on retrieved chunks, not just on history", "🔗 Metrics: **Micrometer token tracking**"],
  "context-5": ["Avoid user id as a metric tag; use tenant or plan", "🔗 Billing: **Cross-charging GPU cost**"],
  "context-6": ["Idle GPU time is a cost too: include utilisation in the rate", "🔗 Speed: **SIMD**"],
  "simd-1": ["Wider registers (AVX-512, NEON) process more floats per instruction", "🔗 Java API: **Vector API and JEP 508**"],
  "simd-2": ["Needs --add-modules jdk.incubator.vector at compile and run time", "🔗 Why: **Embeddings need it**"],
  "simd-3": ["Normalising vectors in advance makes cosine equal to a plain dot product", "🔗 Code: **Dot product with the Vector API**"],
  "simd-4": ["Handle the tail elements with a scalar loop or a mask", "🔗 Comparison: **Why not trust auto-vectorization**"],
  "simd-5": ["Benchmark with JMH to prove the gain on your hardware", "🔗 Decision: **When to use it**"],
  "simd-6": ["Measure first: network and model calls usually dominate the latency", "🔗 Back to the runtime: **What is Ollama**"]
};

// Extra points per card (answers are padded to 10 points)
(window.EXTRA = window.EXTRA || {}).javaai = {
 "runtime-1": [
  "**Install**: one binary, then 'ollama pull <model>' downloads a model",
  "**Models** are stored as quantized GGUF files, so a 7B model fits in about 5 GB",
  "**Trade-off**: you own the GPUs, patching and capacity planning",
  "**API** also has /api/embed for embeddings, so one server can serve chat and RAG",
  "**Interview line**: 'Ollama = private, simple, good for in-house AI'"
 ],
 "runtime-2": [
  "**generate** returns text plus context tokens; **chat** takes the full message list each call",
  "Use **chat** for memory, tools and system prompts",
  "**stream: true** returns JSON lines; **stream: false** returns one reply",
  "Options like **temperature** and **num_ctx** go in an 'options' object",
  "Pitfall: sending the whole history to /generate by hand duplicates what chat already does"
 ],
 "runtime-3": [
  "Default parallelism is chosen automatically and depends on memory",
  "**Example**: 4 slots with an 8k context need 4 KV caches in VRAM",
  "Higher parallel = more throughput but **slower per request**",
  "**OLLAMA_MAX_QUEUE** sets how many requests may wait",
  "Pitfall: raising parallel until the model no longer fits on the GPU"
 ],
 "runtime-4": [
  "**Layers** are split between GPU (fast) and CPU (slow)",
  "A partial offload can make speed drop sharply compared with a full GPU fit",
  "**VRAM budget** = weights + KV cache + overhead",
  "Smaller context (num_ctx) frees VRAM for more layers",
  "**Tip**: pick a quantization (Q4_K_M) that fits fully on the GPU"
 ],
 "runtime-5": [
  "**Cold start** can take many seconds to load a large model into VRAM",
  "**KEEP_ALIVE=-1** keeps a model loaded forever; the default unloads after minutes",
  "Warm-up: send a tiny prompt at application start",
  "**Measure p95**, not the average",
  "Pitfall: a long prompt makes the first token slow even on a warm model"
 ],
 "runtime-6": [
  "**Bulkhead**: a semaphore limits concurrent calls per instance",
  "**Circuit breaker** opens after repeated failures and stops piling on load",
  "**Fallback** options: cached answer, smaller model, or a polite 'busy' message",
  "**Queue limits**: reject early with 429/503 rather than time out silently",
  "Different models on separate boxes avoid swap-in/swap-out delays"
 ],
 "orchestration-1": [
  "**Why**: both hide provider differences, so changing from Ollama to a cloud model is mostly config",
  "They offer **chat memory, tools, RAG retrievers, structured output** out of the box",
  "**LangChain4j** works in plain Java, Quarkus and Spring Boot",
  "**Spring AI** fits best if you already live in the Spring ecosystem",
  "Pitfall: letting framework classes leak into your business code"
 ],
 "orchestration-2": [
  "Annotated methods become **prompts**: @SystemMessage sets rules, @UserMessage the request",
  "Variables use **{{name}}** placeholders filled from @V parameters",
  "Add memory, tools and RAG with **AiServices.builder()**",
  "Interfaces are **easy to mock** in tests",
  "Pitfall: very long prompt strings inside annotations; load from resource files"
 ],
 "orchestration-3": [
  "**Records** are immutable, which suits LLM results",
  "Describe fields with @Description so the model knows what each means",
  "Use **enums** for fixed choices",
  "Check ranges and null values after parsing",
  "Pitfall: nested or very large records fail more often with small models"
 ],
 "orchestration-4": [
  "**LLMs are stateless**: every call must carry the history",
  "**MessageWindow(N)** is simple; **TokenWindow** protects the context limit",
  "Memory ids come from the **logged-in user and conversation**, not from the client request",
  "Include the system prompt in every window",
  "Pitfall: a single shared memory object mixes users' conversations"
 ],
 "orchestration-5": [
  "**ChatMemoryProvider** builds one memory per id on demand",
  "A persistent **ChatMemoryStore** (Redis/JDBC) survives restarts and works across pods",
  "Per-conversation locks keep message order correct",
  "Serialize large histories efficiently and **trim before saving**",
  "Pitfall: unbounded history grows memory and cost"
 ],
 "orchestration-6": [
  "Put rules in the **system message**, the user's text in the **user message**",
  "Wrap retrieved chunks in tags like <context> and say 'this is data, not instructions'",
  "**Limit tools** the model can call",
  "Check output for leaked instructions",
  "Pitfall: concatenating user text into the system prompt"
 ],
 "orchestration-7": [
  "**Causes**: extra prose around JSON, missing fields, wrong types, truncation by max tokens",
  "Raise **max tokens** so JSON is not cut off",
  "Use the framework's **JSON schema / response format** feature",
  "Validate with Bean Validation and **retry once with the error message**",
  "Store failing outputs for **regression tests**"
 ],
 "vector-1": [
  "**Flow**: embed query → nearest-neighbour search → top-k chunks → build prompt",
  "Each row holds **id, text, embedding, metadata** (tenant, source, version)",
  "Quality depends on **chunking and embedding model** at least as much as on the database",
  "Typical sizes: 384-1536 dimensions",
  "Pitfall: indexing without keeping the original text and source id"
 ],
 "vector-2": [
  "**pgvector** gives SQL joins, transactions, backups and row-level security",
  "**Chroma** is quick to start but has fewer production features",
  "Postgres tuning (shared buffers, work_mem) matters for vector workloads",
  "Switch to a dedicated engine only when **latency or scale** tests demand it",
  "Pitfall: choosing by hype instead of measuring recall and latency"
 ],
 "vector-3": [
  "**Cosine** ignores length; **inner product** is fastest on normalised vectors; **L2** measures distance",
  "Create the index with the **matching operator class** (vector_cosine_ops, vector_l2_ops)",
  "Cosine distance = 1 − cosine similarity",
  "Normalising vectors makes cosine and inner product rank the same",
  "Pitfall: mixing operators between index and query"
 ],
 "vector-4": [
  "**HikariCP** reuses connections instead of opening a new one per query",
  "Rule of thumb: pool size close to **CPU cores × 2** of the database, not the app thread count",
  "Set **connection timeout** and leak detection",
  "Use read replicas for heavy search load",
  "Pitfall: long vector queries holding connections while the pool starves"
 ],
 "vector-5": [
  "**HNSW** params: m (links), ef_construction (build quality), ef_search (query width)",
  "**IVFFlat** params: lists (clusters), probes (clusters searched)",
  "HNSW uses more memory and builds slower, but gives better recall at low latency",
  "Raising ef_search or probes improves recall and increases latency",
  "Pitfall: building IVFFlat on an empty table"
 ],
 "vector-6": [
  "Add an **index on tenant_id** (or partition by tenant)",
  "**Filtered ANN** can return fewer than k rows; raise ef_search or use iterative scans",
  "**Row-level security** gives defence in depth",
  "Test: two tenants querying the same text must never see each other's chunks",
  "Pitfall: trusting a tenant id sent in the request body"
 ],
 "vector-7": [
  "**Checklist**: index used? right operator? filter bypass? stale statistics? memory pressure?",
  "Run **ANALYZE** after big loads",
  "Compare ANN results with exact search on a sample to measure recall",
  "Watch **shared_buffers** and cache hit ratio",
  "Pitfall: tuning the index before checking the query plan"
 ],
 "graph-1": [
  "**Nodes** = things (Person, Product); **relationships** = links (WORKS_AT, BOUGHT)",
  "Great for **who-is-connected-to-whom**, dependencies, fraud rings, org charts",
  "Vectors answer 'what is similar'; graphs answer 'how is it connected'",
  "**Cost**: building and maintaining the graph",
  "Pitfall: adding a graph when simple vector search already answers the questions"
 ],
 "graph-2": [
  "**Neo4j**: Cypher, mature tools, ACID, easiest to start",
  "**JanusGraph**: Gremlin, scales on Cassandra/HBase, more operations work",
  "Check licence and cluster features for **Neo4j editions**",
  "Also consider **Memgraph, Neptune, ArangoDB**",
  "Pitfall: choosing a distributed graph before you have a scale problem"
 ],
 "graph-3": [
  "**Pattern**: (a:Person)-[:KNOWS]->(b:Person) draws the shape of the data",
  "Use **MERGE** to avoid duplicates and **CREATE** for new items",
  "Run reads in **read transactions** and keep writes short",
  "Neo4j Java driver supports **async and reactive** sessions",
  "Pitfall: opening a new driver per request; create one and reuse it"
 ],
 "graph-4": [
  "Always pass values as **$parameters**",
  "Allowlist labels and relationship types if they come from the model",
  "Run LLM-generated Cypher with a **read-only role** and a timeout",
  "Limit rows with **LIMIT**",
  "Pitfall: letting the model write to the graph without review"
 ],
 "graph-5": [
  "Example question: 'Which suppliers affect product X?' needs several hops",
  "Convert paths to short sentences like 'Supplier A → part B → product X'",
  "Keep the context **small**: top paths only",
  "Combine with normal chunk retrieval for text details",
  "Pitfall: dumping a huge subgraph into the prompt"
 ],
 "graph-6": [
  "Use **PROFILE** or EXPLAIN to see cost",
  "Avoid unbounded patterns like [*]",
  "**Supernodes** (nodes with millions of links) need filters or pre-aggregation",
  "Cache common traversals",
  "Add relationship-type and property indexes"
 ],
 "cache-1": [
  "**Flow**: embed → search cache → hit? return stored answer : call LLM and store",
  "Typical savings: lower **cost and latency** for FAQ-style traffic",
  "Stores **query vector, answer, metadata, TTL**",
  "Backed by **Redis (RediSearch vectors)** or pgvector",
  "Works best where many users ask the **same things differently**",
  "Pitfall: serving a cached answer that is stale or belongs to another user"
 ],
 "cache-2": [
  "Include **model, prompt version, tenant** in the cache entry",
  "The cache lookup should be **faster than the LLM call** by a wide margin",
  "On a miss, write the new entry **asynchronously**",
  "Log hit/miss for metrics",
  "Pitfall: caching answers that contain personal data"
 ],
 "cache-3": [
  "**Exact cache** key = hash of normalised text (trim, lowercase)",
  "Exact is deterministic and cheap; semantic handles paraphrases",
  "Layered design: **exact → semantic → LLM**",
  "Semantic adds one embedding call per request",
  "Pitfall: semantic hits for questions that differ in a key detail ('refund 30 days' vs '60 days')"
 ],
 "cache-4": [
  "Cosine distance example: 0.05 = very close, 0.3 = loosely related",
  "Collect **labelled pairs** (same/different) and pick the threshold by precision",
  "Use **different thresholds** for different topics or risk levels",
  "Add a **second check** for risky questions",
  "Review near-threshold hits regularly"
 ],
 "cache-5": [
  "Do not cache: **personal data, live prices, time-based answers, tool results**",
  "**Tenant id** in the key prevents cross-customer leaks",
  "Use **TTL** for freshness and **versioned keys** for deployments",
  "Invalidate when documents or prompts change",
  "Pitfall: no way to flush the cache quickly in an incident"
 ],
 "cache-6": [
  "Redis index: FLAT (exact, small) or HNSW (large)",
  "Dimension and distance metric must **match the embedding model**",
  "Add **TTL on keys** so memory stays bounded",
  "Monitor memory, hit rate and latency",
  "Fail open: a cache outage must never take the app down"
 ],
 "guard-basics-1": [
  "Prompts are suggestions; **guardrails are enforcement** in code",
  "They protect **users, company data, and the budget**",
  "They also keep answers on-topic and in the right format",
  "**Examples**: block 'ignore previous instructions', mask card numbers, reject invalid JSON",
  "Pitfall: adding guardrails only at the end of the project"
 ],
 "guard-basics-2": [
  "Order: **auth/rate limit → input guard → retrieval → context guard → LLM → tool guard → output guard**",
  "Early blocks save **tokens and GPU time**",
  "Every block returns a **safe, consistent refusal**",
  "Log the decision for review",
  "Pitfall: checking only the final answer"
 ],
 "guard-basics-3": [
  "**Input checks**: length, language, injection patterns, PII, topic allowlist",
  "**Output checks**: toxic content, secrets, PII, groundedness, schema validity",
  "Input guards are **cheaper** because they stop work early",
  "Output guards catch **model mistakes**, not only attacks",
  "Use both: they cover different failures"
 ],
 "guard-basics-4": [
  "**Rules** examples: regex for card numbers, max length, banned words",
  "**Model-based** examples: Llama Guard, toxicity classifier, LLM judge",
  "Rules have **low latency and are predictable**; models handle nuance",
  "Use rules for the obvious and models for the ambiguous",
  "Pitfall: relying on a keyword list alone"
 ],
 "guard-basics-5": [
  "OWASP LLM Top 10 (2025) examples: **LLM01 prompt injection, LLM02 sensitive info disclosure, LLM05 improper output handling**",
  "Also: **supply chain, data poisoning, system prompt leakage, vector/embedding weaknesses**",
  "Use the list as a **threat-model checklist**",
  "Map each risk to a **guardrail and a test**",
  "Pitfall: treating the list as a one-time audit"
 ],
 "guard-basics-6": [
  "System prompts can be **overridden, leaked or ignored**",
  "A prompt cannot enforce **permissions or budgets**",
  "Put hard rules in **code**: allowlists, schemas, authorisation",
  "Prompts shape behaviour; guardrails **guarantee limits**",
  "Pitfall: putting secrets in the system prompt"
 ],
 "guard-basics-7": [
  "**Layer 1** auth + rate limit; **Layer 2** input rules; **Layer 3** input model",
  "Each layer has **different failure types**, so gaps rarely line up",
  "Design assuming **any single layer can fail**",
  "Measure each layer's catch rate",
  "Keep the cost of the full stack within a latency budget"
 ],
 "guard-attacks-1": [
  "**Examples**: 'ignore previous instructions', 'you are now DAN', hidden text in a PDF",
  "Impacts: **data leaks, wrong actions, policy bypass**",
  "No complete fix exists; reduce **likelihood and impact**",
  "Use separation, validation, least privilege and approvals",
  "Test regularly with attack suites"
 ],
 "guard-attacks-2": [
  "**Direct**: typed in chat; **indirect**: found in web pages, files, emails, tool outputs",
  "Indirect attacks **scale** because one poisoned document hits many users",
  "Defences: treat retrieved text as **untrusted**, strip hidden content, restrict tools",
  "Show sources so users can verify",
  "Test with **poisoned documents** in your own corpus"
 ],
 "guard-attacks-3": [
  "**Jailbreak**: trick the model into breaking its safety policy (e.g. role-play)",
  "**Injection**: make the model follow attacker instructions inside your app",
  "Different targets: **model rules vs application logic**",
  "Both can use similar wording",
  "Defend with model-safety checks **and** app-level controls"
 ],
 "guard-attacks-4": [
  "**Leaks** reveal business rules, tool names and sometimes secrets",
  "Assume the prompt is **not secret**",
  "Keep sensitive logic in code and **credentials in Vault**",
  "Use a **canary token** to detect leaks",
  "Pitfall: 'Never reveal these instructions' as the only defence"
 ],
 "guard-attacks-5": [
  "**Heuristics** are fast but easy to evade",
  "**Classifiers** (fine-tuned models) catch more variants",
  "**Normalise** text first: Unicode, case, spacing, homoglyphs",
  "Score risk and **block above a threshold**; log medium scores",
  "Pitfall: scanning only English"
 ],
 "guard-attacks-6": [
  "**Ingestion scan**: strip scripts, hidden text, strange instructions",
  "**Query-time scan**: check top-k chunks again",
  "Label chunks as **data**; never allow them to call tools directly",
  "Restrict outbound actions after reading untrusted content",
  "Use **source trust levels** (internal wiki vs random web)"
 ],
 "guard-attacks-7": [
  "**Examples**: model output inserted into HTML (XSS), SQL, shell commands, file paths",
  "Treat output like **user input** for the next system",
  "Use **parameterised queries**, HTML encoding, allowlists",
  "Never run model-generated code without a **sandbox**",
  "Validate JSON against a schema"
 ],
 "guard-java-1": [
  "LangChain4j guardrails run **around the AI Service call**",
  "Input guardrails can **rewrite or block**; output guardrails can **block, reprompt or retry**",
  "They are plain Java classes: **testable with JUnit**",
  "Configure order explicitly",
  "Pitfall: swallowing the failure reason; log it"
 ],
 "guard-java-2": [
  "Check **length first** (cheap), then patterns, then PII",
  "Return a **clear failure** with a safe message",
  "Keep guardrails **stateless** so they scale",
  "Unit-test with attack strings and normal text",
  "Reuse the same checks in **HTTP filters** if needed"
 ],
 "guard-java-3": [
  "Options: **pass, block, reprompt, rewrite/redact**",
  "Reprompt example: 'Your answer was not valid JSON. Return only JSON.'",
  "Limit retries to **1-2**",
  "For unsafe content: return a fixed safe answer",
  "Log each action with a reason code"
 ],
 "guard-java-4": [
  "Spring AI **Advisors** wrap the ChatClient call (before and after)",
  "Built-in **SafeGuardAdvisor** blocks configured sensitive words",
  "Write a **custom advisor** for PII, injection, or schema checks",
  "Advisors are ordered by **priority**",
  "Pitfall: expensive checks running on every request; use risk-based routing"
 ],
 "guard-java-5": [
  "Detect with **regex** (email, phone, card) and **NER/Presidio** (names, addresses)",
  "Options: **mask** (****), **remove**, or **tokenize** and restore later",
  "Apply on **input, retrieved chunks, output and logs**",
  "Keep the token map in a **secure store** with a short TTL",
  "Pitfall: sending raw PII to external APIs"
 ],
 "guard-java-6": [
  "Pull the model with Ollama and send content as a chat message",
  "Output is a verdict (safe/unsafe) and **category codes**",
  "Run it on **input and output** for high-risk apps",
  "It is a **second model call**: budget latency and GPU",
  "Pitfall: ignoring non-English or encoded text"
 ],
 "guard-java-7": [
  "Use **virtual threads or CompletableFuture** for parallel checks",
  "Run cheap checks inline and heavy ones **in parallel with retrieval**",
  "Cancel the LLM call if a guard fails",
  "Set **timeouts** per guard",
  "For streaming, check **buffered sentences** before sending"
 ],
 "guard-java-8": [
  "Parse JSON into a **record or class**",
  "Validate with **Bean Validation** (@NotBlank, @Size, @Min)",
  "Use **enums** and allowlists for fixed values",
  "Reject unexpected fields",
  "On failure: reprompt once, then return a typed error"
 ],
 "guard-prod-1": [
  "**Groundedness check**: split the answer into claims and verify each against chunks",
  "Methods: **NLI model, LLM judge, citation matching**",
  "Block, rewrite, or add 'I'm not sure' when unsupported",
  "Apply fully to **high-risk** topics; sample elsewhere",
  "Pitfall: judging against irrelevant chunks"
 ],
 "guard-prod-2": [
  "**Allowlist tools** per role and per route",
  "**Validate arguments** (types, ranges, ids) before running",
  "**Approval** for writes, deletes, payments",
  "**Rate-limit tool calls** and cap loop iterations",
  "Log every call with user, args, result"
 ],
 "guard-prod-3": [
  "**Fail closed** = block when the guard fails (safer)",
  "**Fail open** = allow and alert (more available)",
  "Choose by **risk and impact**",
  "Use timeouts and circuit breakers on guard services",
  "Pitfall: leaking error details in the refusal"
 ],
 "guard-prod-4": [
  "Good refusal: 'I can't help with that, but I can help with X.'",
  "Keep it **short, polite and consistent**",
  "Do not reveal **which rule** fired",
  "Use the right **HTTP status** (400/403/422) and error codes",
  "Provide a path to a human for false positives"
 ],
 "guard-prod-5": [
  "Build a **test set** with attacks and normal prompts",
  "Measure **attack success rate** and **false-positive rate**",
  "Run in **CI** on every rule, prompt or model change",
  "Add **every real incident** as a new test",
  "Tools: garak, promptfoo, PyRIT"
 ],
 "guard-prod-6": [
  "Dashboards: **blocks by rule/category/tenant**, guard latency p95, override rate",
  "Alert on **sudden spikes** and on a rate near zero (a broken guard)",
  "Sample **blocked and allowed** items for human review",
  "Redact PII in logs",
  "Review weekly and adjust rules"
 ],
 "guard-prod-7": [
  "**Cheap-first** ordering stops most bad requests early",
  "Use a **small, quantised guard model**",
  "**Cache verdicts** for repeated inputs",
  "Run checks **in parallel** and set a latency budget",
  "Apply heavy checks only to **high-risk** routes"
 ],
 "guard-prod-8": [
  "**Normalise**: Unicode NFKC, case, whitespace, zero-width characters",
  "**Decode**: base64, URL-encoding, leetspeak, ROT13",
  "Use **multilingual** guard models or translate first",
  "Re-check after each decoding step",
  "Keep a growing **bypass regression set**"
 ],
 "security-1": [
  "**Network**: TLS/mTLS, private subnets",
  "**Identity**: OAuth2/OIDC, service accounts",
  "**Data**: encryption, tenant isolation, ACLs",
  "**App**: input/output guardrails, rate limits",
  "**Ops**: secrets management, audit logs, monitoring",
  "Pitfall: securing the API but leaving the model server open"
 ],
 "security-2": [
  "**Users**: OAuth2/OIDC login → JWT in Authorization header → Resource Server validates",
  "**Services**: client credentials with short-lived tokens",
  "Validate **issuer, audience, expiry, signature**",
  "Map **claims** (tenant, roles) to filters and permissions",
  "Use **mTLS** between internal services",
  "Pitfall: trusting a user id or tenant id from the request body"
 ],
 "security-3": [
  "**Dynamic secrets** create short-lived database users",
  "**Policies** limit which app can read which secret",
  "**Audit log** shows who read what",
  "Rotation removes the pain of leaked keys",
  "Spring Cloud Vault loads secrets into the app at startup"
 ],
 "security-4": [
  "**Why**: GPUs are scarce; one noisy user can block others",
  "Limits per **user, tenant, API key and model**",
  "**Token bucket** algorithms (Bucket4j) are common",
  "Estimate output tokens up front with **max_tokens**",
  "Return **429 with Retry-After**",
  "Use limits also for **cost control**"
 ],
 "security-5": [
  "Store **ACL, tenant, classification** as metadata on every chunk",
  "Apply the filter **inside the vector query**",
  "Sync permissions from the source system regularly",
  "Re-check authorisation when **tools** fetch documents",
  "Test with users who must not see certain files"
 ],
 "security-6": [
  "Embeddings **leak meaning** and can be partly inverted",
  "Control access to the vector DB like the source documents",
  "**Encrypt** at rest and in transit",
  "**Redact PII** before embedding",
  "Avoid exposing raw vectors in APIs"
 ],
 "deploy-1": [
  "**Docker**: same image from laptop to production",
  "**Kubernetes**: Deployments, Services, HPA, ConfigMaps, Secrets",
  "Separate pods for **API, model server, vector DB, Kafka consumers**",
  "Health checks: **readiness** (model loaded) and **liveness**",
  "Resource requests/limits prevent noisy neighbours",
  "Pitfall: baking large models into the image; use volumes or model registries"
 ],
 "deploy-2": [
  "Install **NVIDIA drivers + Container Toolkit** on the node",
  "Kubernetes uses the **device plugin** to expose nvidia.com/gpu",
  "Use **node selectors/taints** so only GPU workloads land on GPU nodes",
  "Check with nvidia-smi inside the pod",
  "**MIG or time-slicing** can share a GPU"
 ],
 "deploy-3": [
  "KServe gives **InferenceService** CRD, autoscaling, canary and model storage integration",
  "Supports runtimes like **vLLM, Triton, TGI**",
  "Scale-to-zero is possible but **cold starts are slow** for LLMs",
  "Standardises metrics and logging",
  "Best when you serve **several models**"
 ],
 "deploy-4": [
  "LLM load is **GPU- and queue-bound**, not CPU-bound",
  "Useful signals: **GPU utilisation, queue length, tokens/s, p95 latency**",
  "Export with **DCGM exporter → Prometheus → HPA/KEDA**",
  "New pods take minutes to load weights, so **scale early**",
  "Keep a **minimum replica count**"
 ],
 "deploy-5": [
  "**mTLS** between all services",
  "**Timeouts and retries** defined centrally",
  "**Canary routing** by percentage or header",
  "**AuthorizationPolicy** limits who can call the model server",
  "Pitfall: retries on long LLM calls can double the load"
 ],
 "deploy-6": [
  "**Canary**: 5% → 25% → 100% while watching quality and latency",
  "Compare with **offline evals** and online metrics",
  "Version **model + prompt + retrieval config** together",
  "Use readiness probes so traffic only starts after warm-up",
  "Rollback must be **one command**"
 ],
 "observability-1": [
  "Classic signals (CPU, errors) miss **quality problems**",
  "Capture: **prompt, retrieved chunks, response, model, tokens, latency, cost, feedback**",
  "Quality can degrade **without any error**",
  "Traces help link a bad answer to its cause",
  "**Privacy**: prompts may include personal data",
  "Different from normal APM because outputs vary"
 ],
 "observability-2": [
  "**OpenTelemetry**: spans, metrics, logs, exporters; GenAI semantic conventions",
  "**LangFuse**: LLM traces, prompt versions, cost, evaluations",
  "Alternatives: **LangSmith, Arize Phoenix, Datadog LLM**",
  "Setup: Java app → OTel Collector → backend",
  "Self-host LangFuse for data control"
 ],
 "observability-3": [
  "Typical spans: **http → auth → guard → cache → embed → search → rerank → LLM → output guard**",
  "Attributes: **model, prompt version, tokens in/out, k, tenant, cache hit**",
  "Mark errors and **finish reason**",
  "Use the same **trace id** across Kafka messages",
  "The slowest span shows where to optimise"
 ],
 "observability-4": [
  "**TTFT**: delay before the first token (user-visible)",
  "**Tokens/second**: generation speed",
  "Also: **queue time, total latency, error rate, cache hit rate, cost per request**",
  "Track **p50/p95/p99**",
  "Alert on TTFT and queue depth spikes"
 ],
 "observability-5": [
  "LangChain4j **ChatModelListener**: onRequest, onResponse, onError",
  "Spring AI exposes **Micrometer observations** on ChatClient",
  "Bridge Micrometer to OpenTelemetry for traces",
  "Add custom tags like **tenant and prompt version**",
  "Time streaming with a start timer and first-chunk callback"
 ],
 "observability-6": [
  "Prompts and answers can contain **PII and secrets**",
  "**Redact** before export; restrict dashboard access",
  "Set **retention** limits",
  "Full prompt logging is costly; sample it",
  "High-cardinality labels (user id) belong in traces, not metrics",
  "Check legal basis for logging user content"
 ],
 "observability-7": [
  "**Slow**: find the slowest span (retrieval? queue? long context?)",
  "**Bad**: compare retrieved chunks with the answer; was the right chunk found?",
  "Check **prompt version and model version** differences",
  "Reproduce with the stored trace input",
  "Add the case to the **golden dataset**"
 ],
 "pipeline-1": [
  "Synchronous ingestion blocks threads and **times out** on big files",
  "Async gives **retries, buffering and independent scaling**",
  "Return **202 + job id**; provide status endpoint or webhook",
  "Backpressure protects the embedding GPU",
  "Pitfall: doing OCR or embedding inside the HTTP request"
 ],
 "pipeline-2": [
  "Stages: **upload → store → extract → clean → chunk → embed → upsert → notify**",
  "Separate topics per stage allow **replays**",
  "Track state: queued, processing, done, failed",
  "Store original files in **object storage**",
  "Version the pipeline so results are reproducible"
 ],
 "pipeline-3": [
  "Define beans like Function<Message, Message>; binder maps them to topics",
  "Supports **Kafka and RabbitMQ binders**",
  "Consumer groups, retries, DLQ configured in YAML",
  "Test with the **test binder** without a broker",
  "Integrates with Spring Cloud Function"
 ],
 "pipeline-4": [
  "At-least-once delivery means **duplicates are normal**",
  "**Idempotent upsert** by chunk id or content hash",
  "Retry with **backoff**; send poison messages to a **DLQ**",
  "Commit offsets after successful processing",
  "Monitor DLQ size and consumer lag"
 ],
 "pipeline-5": [
  "Same key → same partition → **order preserved**",
  "Max parallelism = number of partitions",
  "**Backpressure**: limit poll size and concurrency",
  "Big payloads: store in S3 and pass a **reference**",
  "Embedding batches improve GPU efficiency",
  "Pitfall: too few partitions to scale later"
 ],
 "pipeline-6": [
  "Plan: **create index v2 → backfill from source/Kafka → verify → switch alias → delete v1**",
  "Keep **model name/version** in metadata",
  "Dual-write new documents to both indexes during migration",
  "Run quality checks on a sample before the switch",
  "Backfill at **low priority** to protect live traffic"
 ],
 "eval-1": [
  "Same input can give **different outputs**, so tests need scores",
  "Evaluate **retrieval and generation separately**",
  "Run before release, in CI, and on production samples",
  "Track **quality, cost, latency** together",
  "Without evals, every change is a guess",
  "Pitfall: manual spot checks only"
 ],
 "eval-2": [
  "**Context precision**: relevant chunks ranked high",
  "**Context recall**: all needed facts were retrieved",
  "**Faithfulness**: answer supported by context",
  "**Answer relevancy**: answer addresses the question",
  "Metrics use an **LLM judge**, so fix the judge model",
  "Scores 0-1; track trends"
 ],
 "eval-3": [
  "Each item: **question, reference answer, source chunk ids**",
  "Include **easy, hard, multi-hop, unanswerable** cases",
  "Source from **support tickets and real logs**",
  "Review by domain experts",
  "Keep a **hidden part** to avoid overfitting"
 ],
 "eval-4": [
  "Use a **rubric** and ask for reasoning plus score",
  "Mitigate bias: **swap order, temperature 0, multiple judges**",
  "Cost grows with test size; use a cheaper judge for large runs",
  "Calibrate with a **human-labelled** sample",
  "Pitfall: same model judging its own output"
 ],
 "eval-5": [
  "Run Ragas in a **Python container** called by CI",
  "Input: JSON with question, answer, contexts, ground truth",
  "Java tests assert **score thresholds**",
  "Alternative: implement faithfulness/relevance prompts in **LangChain4j**",
  "Store results to chart trends"
 ],
 "eval-6": [
  "**Data drift**: documents change; **model drift**: provider updates; **prompt drift**: edits",
  "Pin **model versions** where possible",
  "Alert when scores drop beyond a **tolerance**",
  "Compare production samples to a baseline weekly",
  "Keep a changelog of prompts, models and index versions"
 ],
 "multimodal-1": [
  "**Modalities**: text, image, audio, video; here mostly **text + image/PDF**",
  "Models like **llava, llama3.2-vision, qwen-vl** run on Ollama",
  "Use cases: **invoices, screenshots, charts, forms**",
  "Images cost many tokens and GPU time",
  "Pitfall: expecting perfect reading of tiny text"
 ],
 "multimodal-2": [
  "Ollama accepts an **images array of base64 strings** in chat messages",
  "LangChain4j wraps this as **ImageContent**",
  "Resize large images (e.g. max 1024px) to save time",
  "Ask a **specific question** about the image",
  "Validate image type and size first"
 ],
 "multimodal-3": [
  "WebFlux uses **Reactor (Mono/Flux)** and a few event-loop threads",
  "Fits **streaming and many slow I/O calls**",
  "Never call blocking APIs on the event loop",
  "Backpressure is built in",
  "Pitfall: mixing blocking JDBC/PDFBox calls into reactive chains"
 ],
 "multimodal-4": [
  "Accept **multipart** as a stream, write to object storage",
  "Return **202** and process async",
  "Enforce **max size, content type, virus scan**",
  "Generate a safe file name and id",
  "Use pre-signed URLs for very large uploads"
 ],
 "multimodal-5": [
  "Wrap with **Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic())**",
  "Use BlockHound in tests to catch blocking calls",
  "Heavy PDFs: move to a **worker consumer**",
  "Limit pages and processing time",
  "Stream pages instead of loading the entire document"
 ],
 "multimodal-6": [
  "Digital PDFs: **text extraction is faster and cheaper**",
  "Scanned or chart-heavy pages: **OCR or vision**",
  "Hybrid: text first, vision for pages with little text",
  "Failures: tables lose structure, small models hallucinate on dense pages",
  "Cap pages and concurrency for GPU safety"
 ],
 "agentic-1": [
  "Tools are described to the model with **name, description, JSON schema**",
  "The model returns **tool name + arguments**; Java runs the method",
  "The result goes back so the model can answer",
  "Works only with models that support **tool calling**",
  "Validate arguments before execution"
 ],
 "agentic-2": [
  "**Loop**: ask → tool call → run → result → ask again → final answer",
  "Set **max iterations** (e.g. 5-10)",
  "Handle tool errors by returning messages",
  "Trace each hop",
  "Parallel tool calls may happen in one step"
 ],
 "agentic-3": [
  "@Tool on the method; @P describes each parameter",
  "Keep tools **small and focused**",
  "Return **compact strings or records**",
  "Register with .tools(...) on AiServices",
  "Unit-test tool methods without the LLM",
  "Use clear names like searchOrders, not doStuff"
 ],
 "agentic-4": [
  "Descriptions are part of the prompt: explain **when to use** and **when not**",
  "Use enums and constraints in parameters",
  "Fewer tools = better accuracy",
  "Test with a set of prompts and check the chosen tool",
  "Avoid two tools with overlapping purpose"
 ],
 "agentic-5": [
  "**Intent router**: classify → fixed handler (predictable, cheaper)",
  "**Agentic routing**: LLM decides tools and order (flexible)",
  "Hybrid: router first, agent only for complex requests",
  "Agents need more **guardrails and monitoring**",
  "Pick by task variability and risk"
 ],
 "agentic-6": [
  "Tools run with the **end user's permissions**",
  "**Allowlist** per role; block dangerous operations",
  "**Human approval** for irreversible actions",
  "Rate limit tool calls",
  "Log arguments and results (redact secrets)"
 ],
 "agentic-7": [
  "Return errors like 'Customer id not found' so the model can retry",
  "Unknown tool names → reject and list valid tools",
  "Cap retries and steps",
  "Fallback answer: 'I couldn't complete this; here is what I found'",
  "Alert on repeated tool failures"
 ],
 "cdc-1": [
  "Reads the **write-ahead log (WAL/binlog)**, not the tables",
  "Events carry **before/after** values and operation (c, u, d)",
  "Near-real-time and **ordered per key**",
  "No change to application code",
  "Ideal for keeping **search, vector and graph stores** current"
 ],
 "cdc-2": [
  "**Dual write** failure example: DB commit succeeds, vector update fails → mismatch",
  "**Nightly batch** leaves answers stale for hours",
  "CDC gives **eventual consistency** with replay",
  "You can **rebuild** stores from the event log",
  "Costs: infrastructure and schema management"
 ],
 "cdc-3": [
  "Kafka Connect runs **connectors** as a managed service",
  "Debezium connector config: DB host, tables, slot name, topic prefix",
  "Output topics per table: **server.schema.table**",
  "**Schema Registry** (Avro/JSON schema) manages formats",
  "Monitor connector status and lag"
 ],
 "cdc-4": [
  "Consumer reads event → **fetch full row** if needed → chunk → embed → upsert",
  "For graph: **MERGE** nodes and edges",
  "Use **content hash** to avoid needless re-embedding",
  "Batch embeddings for GPU efficiency",
  "Keep **source id and version** in metadata"
 ],
 "cdc-5": [
  "**Deletes**: remove vectors and graph nodes; handle tombstones",
  "**Updates**: replace all chunks of the document, not only some",
  "Use **stable ids** so upserts are idempotent",
  "Soft delete flags still need filtering",
  "Test the delete path explicitly"
 ],
 "cdc-6": [
  "**Replication slot** retains WAL until read; stalled consumers fill the disk",
  "**Schema changes** can break consumers; evolve compatibly",
  "**Initial snapshot** on large tables can load the DB",
  "Monitor **lag, slot size, connector errors**",
  "Plan for re-snapshot and backfill"
 ],
 "context-1": [
  "Context = **system + history + retrieved chunks + question + output**",
  "Overflows either error out or truncate silently",
  "Counting lets you **budget** and avoid surprises",
  "Cost and latency scale with tokens",
  "Different models have different limits"
 ],
 "context-2": [
  "JTokkit implements **OpenAI-style tokenizers** (cl100k, o200k)",
  "For Llama/Mistral models counts are **estimates**",
  "Use provider counts after the call for accuracy",
  "Add a **5-10% safety margin**",
  "Cache tokenizer instances"
 ],
 "context-3": [
  "Keep **system prompt + last N turns** within a token budget",
  "Drop oldest first, or **summarise** them into a short note",
  "Keep important facts (user name, preferences) in a pinned note",
  "Store the full history elsewhere for audit",
  "Pitfall: cutting a tool call from its result"
 ],
 "context-4": [
  "Example budget: 8k window = 1k system + 2k history + 4k chunks + 1k answer",
  "Reserve **output tokens** first",
  "Trim chunks by **score** until the prompt fits",
  "Make the budget **configurable** per model",
  "Log actual usage vs budget"
 ],
 "context-5": [
  "Metrics: **llm.tokens.input / output** counters tagged by model and tenant",
  "Timer for **latency**",
  "Gauge for queue depth or active requests",
  "Dashboards in Grafana; alerts on spikes",
  "Avoid user ids as tags (cardinality)"
 ],
 "context-6": [
  "Formula: GPU $/hour ÷ tokens/hour = cost per token",
  "Allocate by **tenant token usage**, adjusted for idle capacity",
  "Show **showback or chargeback** reports",
  "Set **quotas and alerts** per tenant",
  "Include embedding and guard-model usage"
 ],
 "simd-1": [
  "**Scalar**: 1 operation per step; **SIMD**: 4-16 floats per step",
  "Instruction sets: **SSE, AVX2, AVX-512, NEON**",
  "Best for **dense numeric loops**",
  "Memory bandwidth can still limit gains",
  "Used in math libraries and databases"
 ],
 "simd-2": [
  "Classes: **FloatVector, VectorSpecies, VectorMask, VectorOperators**",
  "Falls back to scalar if hardware lacks support",
  "Needs the JDK incubator module flag",
  "Portable across CPU types",
  "JEP 508 is the tenth incubation round (JDK 25)"
 ],
 "simd-3": [
  "Similarity search computes **many dot products**",
  "768-1536 floats per vector × thousands of candidates",
  "Vectorisation can give a **big speed-up** on CPU",
  "Matters for in-JVM reranking and caches",
  "GPU/DB engines may already do this for you"
 ],
 "simd-4": [
  "Loop: load chunks of a and b, **fma** into an accumulator",
  "Finish with **reduceLanes(ADD)**",
  "Handle remaining elements with a scalar loop",
  "Use arrays of **float**, aligned data helps",
  "Compare with a scalar version in a JMH benchmark"
 ],
 "simd-5": [
  "Auto-vectorisation works for simple, countable loops",
  "**Floating-point reductions** are not reordered because of strict semantics",
  "Behaviour can change between JVM versions",
  "Explicit API makes **intent and performance predictable**",
  "Benchmark both approaches"
 ],
 "simd-6": [
  "Use when: **hot loop, large arrays, CPU-bound, measured bottleneck**",
  "Skip when: I/O dominates, arrays are tiny, or the DB does the work",
  "Keep a **scalar fallback** and tests for equality within tolerance",
  "Document the JVM flags",
  "Re-evaluate when the API leaves incubation"
 ]
};
