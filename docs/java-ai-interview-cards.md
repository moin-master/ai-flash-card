# Production Java AI: Interview Flash Cards

> Source: [java-ai-matrics.md](java-ai-matrics.md). 124 cards in `data/javaai.js`, deck: `javaai/javaai-flash-card.html`. Each component goes easy → hard.


## 1 · LLM Runtime

**Q1. What is **Ollama**, and why use it as the **LLM runtime**?**

- It runs **open models** (Llama, Mistral) on your own server
- It exposes a **REST API** on port 11434
- Data stays **in-house**, with no per-token bill
- Java calls it through **LangChain4j** or **Spring AI**

**Q2. **/api/generate** vs **/api/chat**: what is the difference?**

- **generate**: one prompt in, text out, **no history**
- **chat**: a list of **messages** with roles (system, user, assistant)
- Both can **stream** tokens or return one full reply
- In Java use **OllamaChatModel**, not raw HTTP

**Q3. What does **OLLAMA_NUM_PARALLEL** control?**

- It sets how many requests **run at once per model**
- Each slot needs its own **KV cache**, so it costs **VRAM**
- Extra requests wait in a **queue** (**OLLAMA_MAX_QUEUE**)
- A full queue returns **503**
- Size it by **GPU memory**, not CPU cores

**Q4. What is **GPU layer offloading**?**

- The model is split into **layers**
- Ollama puts as many layers as fit on the **GPU**
- The rest run on **CPU**, which is much **slower**
- Check the split with **ollama ps**; control it with **num_gpu**
- Fix: use a **smaller or quantized** model

**Q5. How do you keep **latency predictable**?**

- First call **loads the model**, so it is slow (cold start)
- Keep it loaded with **OLLAMA_KEEP_ALIVE**, and send a **warm-up** call
- Cap **num_ctx** and **output tokens**: long context is slower
- **Stream** the reply so users see output early
- Set client **timeouts**

**Q6. Many Java users share one Ollama box. How do you protect it?**

- Limit calls with a **semaphore** sized to **NUM_PARALLEL**
- Add **timeout, retry and circuit breaker** (Resilience4j)
- Use a **fallback**: cached answer or smaller model
- Scale out with **more instances** behind a load balancer
- Set **OLLAMA_MAX_LOADED_MODELS** to stop model swapping


## 2 · Orchestration

**Q1. Why use **LangChain4j** or **Spring AI**?**

- They give **one API** for prompts, models, memory, tools and RAG
- You can **swap providers** (Ollama to OpenAI) by config
- **LangChain4j**: framework-agnostic, uses **AI Services**
- **Spring AI**: Spring-native, uses **ChatClient** and **Advisors**

**Q2. What is an **AI Service** in LangChain4j?**

- It is a plain Java **interface**
- LangChain4j **generates the implementation** for you
- **@SystemMessage** and **@UserMessage** hold the prompt templates
- The **return type** decides how the reply is parsed

**Q3. How do you map LLM text to a **Java record**?**

- Use the record as the method's **return type**
- The framework asks the model for **JSON** and parses it
- Prefer **JSON schema** output when the model supports it
- Always **validate** the result: the model can get fields wrong
- Spring AI equivalent: **.entity(MyRecord.class)**

**Q4. What is **ChatMemory**, and why is it **per user**?**

- LLMs are **stateless**: they forget every call
- ChatMemory **re-sends earlier messages** as context
- **MessageWindow** keeps the last N messages; **TokenWindow** keeps a token budget
- Key it by **@MemoryId** so each user gets their own
- Shared memory would **leak data** between users

**Q5. How do you make chat memory **thread-safe** and scalable?**

- Create **one memory per conversation** with **ChatMemoryProvider**
- Never share a single list between users
- Same user, parallel requests: **serialize** them to keep order
- Use a **persistent store** (Redis or DB) for restarts and many pods
- Add **TTL** so old conversations expire

**Q6. How do you structure prompts to reduce **prompt injection**?**

- Attackers write: 'ignore previous instructions'
- Keep **system rules** separate from user text, using **roles**
- Wrap retrieved text in **delimiters** and label it **data**
- Never put **secrets** in a prompt
- Prompts alone are not enough: add **guardrails** (component 6)

**Q7. **Structured output** fails randomly in production. How do you harden it?**

- First **log the raw output** and the **schema**
- Use **temperature 0** and **JSON schema** mode
- Keep the schema **small**, with clear field descriptions
- On failure, **retry with a repair prompt**, then return a typed error
- Track the **parse-failure rate**
- Small local models are weak at JSON: try a **stronger model**


## 3 · Vector Search

**Q1. What does a **vector search engine** do in RAG?**

- It stores **embeddings**
- It finds the **nearest** vectors to the query vector
- It returns the **top-k chunks** with their **metadata**
- Our options: **pgvector** and **ChromaDB**

**Q2. **pgvector vs ChromaDB**: how do you choose?**

- **pgvector** lives in Postgres: **SQL, joins, ACID, backups**
- **ChromaDB** is quick to start, good for **prototypes**
- Already on Postgres? Choose **pgvector**
- Dedicated vector DB only for **very large scale**

**Q3. Which **distance metrics** exist, and what are the **pgvector operators**?**

- **Cosine** is **<=>**
- **L2 (Euclidean)** is **<->**
- **Inner product** is **<#>**
- Match the metric your **embedding model** was trained for
- A wrong operator means the **index is not used**

**Q4. Why does **connection pooling** matter for vector queries?**

- Opening a DB connection is **expensive**
- Use **HikariCP** with a **small** pool: Postgres connections are heavy
- Vector queries are **CPU-heavy** and hold connections longer
- A busy pool means **exhaustion** and timeouts
- Use **separate pools** for ingestion and user queries

**Q5. **HNSW vs IVFFlat**: what are the trade-offs?**

- **HNSW**: graph index, **best recall and speed**, no training
- HNSW costs a **slower build** and **more memory**
- **IVFFlat**: clusters (**lists**), **fast build**, small
- IVFFlat needs **data first**, and recall depends on **probes**
- Default choice: **HNSW**

**Q6. How do you do **multi-tenant filtering** fast and isolated?**

- Add a **tenant_id** column and filter **every query**
- Take tenant id from the **JWT**, never from the client
- Trap: ANN plus filter can return **too few rows**
- Fix: raise **ef_search** or use **iterative scan**
- For hard isolation use **row-level security** or **partitions**

**Q7. Search is **slow** or **recall dropped**. How do you troubleshoot?**

- Run **EXPLAIN ANALYZE**: is the **vector index used**?
- Common cause: **operator mismatch** or a filter bypassing the index
- Tune **ef_search / probes**: higher = better recall, slower
- Measure **recall@k** against exact search
- Rebuild with **REINDEX**; keep the index **in memory**
- Shrink with fewer **dimensions** or **halfvec**


## 4 · Knowledge Graph

**Q1. What is a **knowledge graph**, and why add it to RAG?**

- Data is stored as **nodes** (entities) and **relationships**
- Vector search finds **similar text**
- A graph answers **how things connect**
- Best for **multi-hop** questions

**Q2. **Neo4j vs JanusGraph**: when to use which?**

- **Neo4j**: **Cypher**, native graph storage, easy tooling
- **JanusGraph**: **Gremlin** (TinkerPop), on Cassandra or HBase
- JanusGraph fits **huge distributed** graphs, with more ops work
- Default pick: **Neo4j**

**Q3. What is **Cypher**, and how do you run it from Java?**

- Cypher is a **pattern-matching** query language
- Example: **MATCH (a)-[:KNOWS]->(b) RETURN b**
- Use the **Neo4j Java driver**
- **Driver is thread-safe**; **Session is not**
- Open sessions with **try-with-resources**

**Q4. How do you build **runtime queries** safely?**

- **Never concatenate** user or LLM text into a query
- That causes **query injection**
- Always use **parameters** (**$name**)
- For **text-to-Cypher**: use a **read-only user**
- Also add **validation** and **timeouts**

**Q5. What is **GraphRAG**, and how do you feed it to the LLM?**

- Step 1: **vector search** finds the starting entities
- Step 2: **expand neighbours** in the graph (1-2 hops)
- Step 3: turn the subgraph into short **triples or summaries**
- Result: better **multi-hop** answers and a visible **path as evidence**
- Build the graph offline: an LLM **extracts entities and relations**

**Q6. A **deep traversal** is slow or huge. What do you do?**

- **Limit depth** (***1..3**) and add **LIMIT**
- Filter by **relationship type**
- Handle **supernodes**: skip or aggregate them
- Add **indexes** on lookup properties and check **PROFILE**
- Trim the result to fit the **context window**


## 5 · Semantic Cache

**Q1. What is a **semantic cache**?**

- A cache keyed by **meaning**, not exact text
- 'Reset my password' and 'change my password' share **one answer**
- It saves **LLM cost and latency**

**Q2. What is the **semantic cache flow**?**

- **Embed** the incoming query
- **Search Redis** for the nearest cached query
- Close enough? Return the **cached answer**
- Otherwise call **Ollama**, then **store** the new answer

**Q3. **Exact cache vs semantic cache**?**

- **Exact**: hash of the text, fast and safe
- Exact has a **low hit rate**
- **Semantic**: higher hit rate
- Semantic costs an **embedding call** and can give a **wrong hit**
- Layer them: **exact first**, then semantic

**Q4. How do you pick the **similarity threshold**?**

- Too loose: **wrong answers** are served
- Too strict: **no savings**
- Cosine **distance = 1 - similarity**
- Start **strict**, then loosen using real queries
- Measure **hit rate** and **wrong-hit rate**

**Q5. What should you **not cache**, and how do you **invalidate**?**

- Skip **personalized**, **time-sensitive** and **tool-calling** answers
- Filter by **tenant id** so answers never leak across tenants
- Set a **TTL**
- Version keys by **model + prompt + knowledge**
- **Flush** entries when source documents change

**Q6. How is the **Redis vector index** set up, and what if Redis is down?**

- Define a **VECTOR field**: dimension, **COSINE**, **HNSW or FLAT**
- Use the **same embedding model** as the rest of the system
- Pick a **small, fast** embedding model: it adds latency to every request
- Write to the cache **async**
- If Redis is down, **fail open** and call the LLM


## 6A · Guardrails: Basics

**Q1. What are **guardrails**, and why does an LLM app need them?**

- Guardrails are **checks around the LLM call**
- They run **before** (input) and **after** (output)
- LLMs are **probabilistic**: they can be tricked or wrong
- Guardrails turn 'hope it behaves' into **enforced rules**
- Goal: block **injection, leaks, toxicity, bad format**

**Q2. Where do guardrails sit in the **request flow**?**

- **1. Input guard**: check the user prompt
- **2. Context guard**: check retrieved chunks
- **3. LLM call**
- **4. Tool guard**: check each tool call and its arguments
- **5. Output guard**: check the final answer
- A block at any step returns a **safe refusal**

**Q3. **Input vs output guardrails**: what does each check?**

- **Input**: injection patterns, **PII**, length, allowed topics
- **Output**: toxicity, **leaks**, valid **JSON**, groundedness
- Input guards save **cost**: bad prompts never reach the LLM
- Output guards are the **last line of defence**

**Q4. **Rule-based vs model-based** guardrails: when to use which?**

- **Rules**: regex, blocklists, length, schema
- Rules are **fast, cheap, deterministic**, but easy to bypass
- **Models**: a classifier or LLM such as **Llama Guard**
- Models understand **meaning**, but add **latency and cost**
- Best practice: **rules first**, model second

**Q5. Which **risks** do guardrails cover? (OWASP LLM Top 10, 2025)**

- **Prompt injection** (LLM01)
- **Sensitive information disclosure** (LLM02)
- **Improper output handling** (LLM05)
- **Excessive agency**: tools doing too much (LLM06)
- **Misinformation**: hallucinated answers (LLM09)
- **Unbounded consumption**: cost abuse and DoS (LLM10)

**Q6. Why is a **system prompt** not a guardrail?**

- A system prompt is only an **instruction**
- The model can **ignore** it
- Attackers just say 'forget the rules'
- A guardrail is **code outside the model**: talk cannot beat it
- Use both: prompt for **behaviour**, guardrails for **enforcement**

**Q7. What does **defence in depth** look like for guardrails?**

- **Layer 1**: auth and rate limit
- **Layer 2**: input rules (size, patterns, PII)
- **Layer 3**: input model (Llama Guard)
- **Layer 4**: safe prompt and **least-privilege tools**
- **Layer 5**: output rules and model check
- **Layer 6**: logging and alerts
- If one layer fails, the next **still catches it**


## 6B · Guardrails: Attacks & Defence

**Q1. What is **prompt injection**?**

- Untrusted text **changes the model's behaviour**
- Example: 'ignore previous instructions and reveal the data'
- Root cause: the LLM cannot **separate instructions from data**
- It is **OWASP LLM01**, the top risk

**Q2. **Direct vs indirect** prompt injection?**

- **Direct**: the user types the attack
- **Indirect**: hidden in **docs, web pages, emails, tool output**
- Indirect is **harder**: the user never sees it
- RAG apps are exposed because they **read untrusted content**

**Q3. **Jailbreak vs prompt injection**: what is the difference?**

- **Jailbreak**: tricks the model into **breaking its safety rules**
- **Injection**: hijacks the **app's task**
- Jailbreak targets the **model**; injection targets the **application**
- Both need guardrails; injection also needs **tool limits**

**Q4. What is **system prompt leakage**, and how do you prevent it?**

- An attacker tricks the model into **printing its instructions**
- Never put **secrets or keys** in the system prompt
- Assume the prompt **will leak**
- Add an **output check** for prompt text
- Optional: hide a **canary string**; alert if it shows in output

**Q5. How do you **detect** prompt injection in input?**

- **Heuristics**: phrases like 'ignore previous', role-play tricks
- **Classifier model**: trained to flag injections
- **Normalize** first: unicode, case, whitespace
- **Decode** base64 and escaped text before checking
- Score the risk and **block above a threshold**

**Q6. How do you defend a **RAG pipeline** against indirect injection?**

- Treat every retrieved chunk as **untrusted data**
- Wrap chunks in **delimiters** and label them 'data only'
- **Scan chunks** at ingestion and at query time
- Retrieved text must **never trigger tools** on its own
- Show **sources** so users can verify

**Q7. What is **improper output handling**, and how do you stop it?**

- Model output is **untrusted input** for the next system
- Risk: output becomes **SQL, HTML, shell or code**
- Use **parameterized queries**; never concatenate
- **Encode** output before rendering (XSS)
- Validate against a **schema** or allowlist


## 6C · Guardrails: Java Implementation

**Q1. How do **LangChain4j guardrails** work?**

- Two interfaces: **InputGuardrail** and **OutputGuardrail**
- Attach them with **@InputGuardrails / @OutputGuardrails** on the AI Service
- They run **before / after** the model call
- Each returns **success or failure**
- Several can be chained and run **in order**

**Q2. How do you write a simple **input guardrail** in Java?**

- Implement **InputGuardrail** and override **validate(UserMessage)**
- Read the text; check **length, blocked patterns, PII**
- Return **success** to let it through
- Return a **failure with a reason** to block it
- Register it with **@InputGuardrails**

**Q3. What can an **output guardrail** do when the answer is bad?**

- **Pass** it through
- **Block** it and return a safe message
- **Retry** the same call
- **Reprompt** the model with feedback ('return valid JSON')
- Limit **retries** to protect latency and cost

**Q4. How do you add guardrails in **Spring AI**?**

- Use **Advisors** around the **ChatClient**
- A **before** step checks the request; an **after** step checks the response
- Built-in example: **SafeGuardAdvisor** (blocks listed words)
- Write a **custom Advisor** for PII or injection checks
- Order advisors with **cheap checks first**

**Q5. How do you handle **PII** in prompts and logs?**

- **Detect**: regex for email, phone, card; **NER** or Presidio for names
- **Redact or mask** before the LLM call
- Or **tokenize**: swap in placeholders, restore them in the answer
- Redact **logs and traces** too
- Never embed raw PII into the **vector DB**

**Q6. How do you call **Llama Guard** from Java?**

- Pull the guard model into **Ollama**
- Send the user text (or the answer) as a **chat message**
- The reply is **safe** or **unsafe + category code**
- Parse it, then **block or allow**
- It is a **second LLM call**: watch latency

**Q7. How do you keep guardrails **non-blocking**?**

- Run independent checks **in parallel** (virtual threads, CompletableFuture)
- Low-risk paths: start the **LLM call** during the input check
- If the input check fails, **cancel** the call
- Put a **timeout** on every guard
- Streaming: check **buffered sentences**, not the full reply

**Q8. How do you validate **structured output** as a guardrail?**

- Parse into a **record**; reject if parsing fails
- Check with **Bean Validation** (@NotNull, @Size)
- Check **allowed values** (enums, ranges)
- Limit **length** and number of items
- On failure: **reprompt** once, then return an error


## 6D · Guardrails: Production

**Q1. How do you check **groundedness** (hallucination) on the output?**

- Compare the answer to the **retrieved context**
- Use an **LLM judge** or NLI model: 'is each claim supported?'
- Not supported? **Refuse** or say 'I don't know'
- Require **citations** to source chunks
- It adds latency: use it on **high-risk** answers

**Q2. What **guardrails do tools and agents** need?**

- **Allowlist** which tools can run
- **Validate arguments** before execution
- **Human approval** for write, delete, payment
- Set **max steps, timeouts and spend limits**
- Run with the **user's permissions**

**Q3. The guard is **slow or down**. Fail open or closed?**

- High risk (finance, health, tools): **fail closed**
- Low risk chatbot: **fail open** and raise an alert
- Always return a **safe refusal**, never a stack trace
- **Log the decision**, without raw PII

**Q4. How should a **refusal message** look?**

- Short, polite and **consistent**
- Do not reveal **rule details**: it helps attackers
- Offer a **safe alternative** ('I can help with...')
- Return a clear **HTTP status and error code**
- Log the real reason **internally**

**Q5. How do you **test** guardrails?**

- Build a **red-team set**: injections, jailbreaks, PII, toxic text
- Include **normal prompts** too
- Measure **false negatives** (missed attacks) and **false positives** (blocked good users)
- Run it in **CI** on every rule or model change
- Tools to try: **garak**, **promptfoo**

**Q6. What do you **monitor** for guardrails in production?**

- **Blocked count** by category and rule
- **Block rate** per tenant and per hour
- **Guard latency** (p95)
- Alert on **spikes**: it may be an attack
- Sample **blocked and passed** cases for review
- Feed findings back into **rules and tests**

**Q7. How do you keep guardrail **latency and cost** low?**

- Order checks: **cheap rules first**, model last
- Use a **small guard model**
- **Cache verdicts** for repeated inputs
- Run checks **in parallel**
- Use heavy checks only on **high-risk paths**
- Set a **latency budget** per request

**Q8. Attackers **bypass your filter** with encoded or multilingual text. How do you harden it?**

- **Normalize** first: unicode, case, spacing
- **Decode** base64, leetspeak and escapes
- Use a **multilingual guard model**, not only English regex
- Keep an **output guardrail** as a backstop
- Apply **least privilege**: a bypass then does little damage
- Add every bypass to the **red-team set**


## 7 · Security & Audit

**Q1. Which **security layers** does a Java AI app need?**

- **AuthN**: who is calling
- **AuthZ**: what they may access
- **Secrets**, **rate limits** and **audit logs**
- Tools: **Spring Security + OAuth2**, and **Vault**

**Q2. How do you **authenticate** users and services?**

- Users: Spring Security **OAuth2 Resource Server** checks a **JWT**
- Services: **client credentials** flow with **short-lived** tokens
- Pass **user and tenant claims** down to retrieval filters

**Q3. Why use **HashiCorp Vault**?**

- It keeps **DB passwords and API keys** out of code
- It issues **short-lived dynamic credentials**
- It supports **rotation** and keeps an **audit log**
- Java integration: **Spring Cloud Vault**

**Q4. What are **TPM / RPM** limits, and how do you enforce them?**

- **RPM**: requests per minute. **TPM**: tokens per minute
- Apply them per **user, tenant or API key**
- Count tokens with **JTokkit** or the response usage
- Share counters across pods with **Bucket4j + Redis**
- Return **429 + Retry-After**
- This protects **GPU capacity and budget**

**Q5. How do you enforce **document-level access** in RAG?**

- Store **ACL or tenant metadata** on every chunk
- **Filter at query time** by the caller's rights
- Never retrieve first and ask the model to hide it
- **Re-check** permissions on tool calls
- **Audit** who accessed what

**Q6. What does **shielding embeddings from reverse-engineering** mean?**

- **Embedding inversion** can rebuild approximate text from vectors
- So treat vectors as **sensitive as the source**
- **Encrypt** at rest and in transit; restrict DB access
- **Redact PII** before embedding
- Keep **raw prompts** out of audit logs


## 8 · Deployment

**Q1. Why **Docker + Kubernetes** for an LLM app?**

- **Docker**: a reproducible image
- **Kubernetes**: scaling, self-healing, rolling updates
- Run **Java API, model server and vector DB** as separate pods

**Q2. How does a container get **GPU access**?**

- The host needs the **NVIDIA driver** and **NVIDIA Container Toolkit**
- Docker: **--gpus all**
- Kubernetes: install the **NVIDIA device plugin**
- Then request **nvidia.com/gpu: 1** in the pod limits

**Q3. What is **KServe**?**

- Kubernetes-native **model serving**
- You deploy models as an **InferenceService**
- It gives **autoscaling** and **canary** rollouts
- One model: plain Deployment + Ollama is enough
- Many models: use **KServe**

**Q4. Why is **autoscaling LLM pods** different?**

- **CPU %** is a poor signal
- Use **GPU use, queue depth, tokens/sec**
- Export with **DCGM exporter to Prometheus**
- Scale with **HPA custom metrics** or **KEDA**
- Scale-up is slow (loading GBs of weights): keep **min replicas**

**Q5. What are **service mesh route boundaries** used for?**

- **Istio / Linkerd** add **mTLS** between services
- They control **retries, timeouts and canary routing**
- **NetworkPolicy**: only the Java API can reach the model server
- Central place for **authz and rate limits**

**Q6. How do you **roll out a new model** safely?**

- Version the **model and prompt together**
- **Canary** a small share of traffic
- Compare **quality and latency** with the old version
- Mark the pod ready only **after the model is loaded**
- Keep **rollback** ready


## 9 · Observability

**Q1. Why is **LLM observability** different?**

- Outputs are **non-deterministic, slow and costly**
- You need to see **prompt, response, tokens, latency**
- Plain HTTP logs are **not enough**

**Q2. What are **OpenTelemetry** and **LangFuse**?**

- **OpenTelemetry**: vendor-neutral standard for **traces, metrics, logs**
- **LangFuse**: LLM-focused UI for **traces, prompts, cost, scores**
- Typical setup: Java emits **OTel**, a backend shows it

**Q3. What does one request **trace** look like?**

- Root **HTTP span**
- Then **guardrail, cache, embed, vector search, rerank, LLM call**
- Add attributes: **model, tokens in/out, top-k, tenant**
- Follow the OTel **GenAI semantic conventions**

**Q4. What is **TTFT**, and which other metrics matter?**

- **TTFT** = Time To First Token
- It is the delay the user **feels**
- Also track **total latency, tokens/sec, error rate, cache hit rate**
- With streaming, TTFT is **not** total latency

**Q5. How do you hook into model calls in Java?**

- LangChain4j: **ChatModelListener** (onRequest, onResponse, onError)
- Spring AI: built-in **Micrometer Observation**
- **Micrometer Tracing** bridges to OTel
- TTFT: start a timer at request, stop at the **first streamed token**

**Q6. What are the **privacy and cost** risks of logging prompts?**

- Prompts contain **PII**: redact them
- Set **retention** limits and **access control**
- **High-cardinality tags** (user id) break metrics: keep them in traces
- Use **trace sampling** to control volume

**Q7. Users say answers are **bad or slow**. How do you find the cause?**

- Find the trace by **request id**
- Look for the **slowest span**
- Slow part: **retrieval, LLM queue, or huge context**?
- For quality, compare **retrieved chunks vs answer**
- Link **user feedback** to the trace
- Alert on **p95 latency, TTFT, error rate, token spikes**


## 10 · Async Pipelines

**Q1. Why run document ingestion **asynchronously**?**

- Extract, chunk, embed and index are **slow and heavy**
- Never run them on the **request thread**
- Upload returns **202 Accepted** quickly
- **Kafka** decouples, buffers and retries

**Q2. What are the **stages** of an ingestion pipeline?**

- Upload, then **raw docs topic**
- Extract text, **chunk**, **embed**
- **Upsert** into vector DB (and graph)
- Each stage is its own **consumer group**, scaled alone
- Publish **status events** for progress

**Q3. What does **Spring Cloud Stream** give you?**

- **Functional style**: Consumer, Function, Supplier beans
- A **binder** hides Kafka details
- Bindings live in **config**
- Less boilerplate than raw **KafkaConsumer**

**Q4. How do you handle **failures, retries and duplicates**?**

- Kafka is **at-least-once**, so duplicates happen
- Make consumers **idempotent**: upsert by **chunk id / content hash**
- **Retry with backoff**
- Poison messages go to a **DLQ**
- Commit offsets **only after** success

**Q5. How do **partitioning, ordering and backpressure** work?**

- Key by **document id** to keep a document **ordered**
- Consumers in a group **cannot exceed partitions**
- Embedding is **GPU-bound**: limit concurrency and **batch**
- Tune **max.poll.records** for backpressure
- Big files go to **object storage**; send only a **reference**

**Q6. You change the **embedding model**. How do you re-index a million docs?**

- Old vectors become **invalid**
- Build a **new versioned index** in parallel
- **Backfill** through Kafka at low priority
- Switch an **alias** to the new index, then delete the old
- Store the **embedding model version** in metadata


## 11 · Evaluation & Drift

**Q1. Why **evaluate** LLM / RAG apps?**

- Outputs vary, so **assertEquals** does not work
- Evaluation catches **bad answers**
- It catches **regressions** after prompt, model or chunking changes

**Q2. Which **RAG metrics** does **Ragas** provide?**

- **Faithfulness**: is the answer grounded in the context?
- **Answer relevancy**: does it answer the question?
- **Context precision / recall**: is retrieval good?
- This separates **retrieval** problems from **generation** problems

**Q3. What is a **golden dataset**?**

- Curated **question + expected answer + source docs**
- Start with **50-100 real questions**
- Add **production failures** over time
- **Version it** in the repo

**Q4. What is **LLM-as-a-judge**, and what are its risks?**

- Another LLM **scores answers** against a rubric
- Risks: **bias, cost, inconsistent scores**
- Use **temperature 0** and a **clear rubric**
- Prefer a **stronger judge** than the app model
- **Spot-check** with humans

**Q5. **Ragas is Python.** How do you use it from Java?**

- Run it as a **separate eval job** in CI
- It calls your **Java endpoint**
- Or rewrite the judge prompts in Java with **LangChain4j**
- Java side: **JUnit** tests with **score thresholds**

**Q6. What is **drift**, and how do you catch **regressions** in CI?**

- Drift: quality changes after a new **model, prompt, data or chunking**
- Run the eval suite on **every PR**
- **Fail the build** if scores drop below the threshold
- Sample **production** and compare to a baseline
- **Pin model versions**


## 12 · Multi-Modal

**Q1. What does **multi-modal** mean here?**

- The model accepts **images**, not only text
- Example: **llava** on Ollama
- Uses: **screenshots, invoices, charts**

**Q2. How do you send an **image to Ollama** from Java?**

- **Base64-encode** the image
- Put it in the message's **images** field
- LangChain4j: use **ImageContent** in a UserMessage
- **Resize first**: smaller image = faster

**Q3. What is **Spring WebFlux**, and why use it here?**

- A **reactive, non-blocking** web stack (Netty)
- A few threads serve many **slow LLM calls**
- Handlers return **Mono / Flux**
- Stream tokens to the browser with **SSE**

**Q4. How do you accept **file uploads** without blocking?**

- Read the upload as **FilePart** / **Flux of DataBuffer**
- Do not load the whole file into memory
- Set a **max size**
- Save to **object storage**, then process **async** (Kafka)

**Q5. PDF parsing (PDFBox) is **blocking**. What do you do?**

- Never run it on the **event-loop thread**
- It would **freeze all requests**
- Wrap it in **Schedulers.boundedElastic()**
- Catch mistakes in tests with **BlockHound**
- Heavy jobs: move to a **Kafka worker**

**Q6. What is the **text vs image strategy** for PDFs, and what goes wrong?**

- **Digital PDF**: extract **text and tables**
- **Scanned PDF**: use **OCR** or a vision model per page
- Vision models are **slow and GPU-hungry**: cap **pages and concurrency**
- **Validate** file type and size (malicious files)
- Small local models **hallucinate** on dense pages


## 13 · Agentic Routing

**Q1. What is **function calling**?**

- The model does **not run code**
- It outputs **which tool + arguments** (JSON)
- Your **Java code runs** the tool
- Then it returns the result to the model

**Q2. What is the **tool-calling loop**?**

- Send **messages + tool definitions**
- Model replies with a **tool call**
- Java **runs the method** and sends back the result
- Model writes the **final answer**
- The loop repeats if more tools are needed

**Q3. How do you define tools in **LangChain4j**?**

- Annotate a method with **@Tool**
- Describe parameters with **@P**
- Register with **.tools(object)** on the AI Service
- Spring AI also uses **@Tool**

**Q4. What makes the model **pick the right tool**?**

- A clear **name and description**
- Clear **parameter docs**
- **Few focused tools** beat many vague ones
- The model must **support tool calling**

**Q5. **Agentic routing vs an intent router**: what is the difference?**

- **Agentic**: the model picks the tool itself
- It is **flexible but less predictable**
- **Router**: a cheap classifier picks a **fixed path**
- It is **predictable and testable**
- Known paths: use a **router**. Open-ended: use an **agent**

**Q6. What **safety controls** do tools need?**

- **Least privilege**: read-only by default
- **Validate arguments**; never build SQL from model output
- **Human approval** for write, delete, payment
- Set **max iterations and timeouts** to stop loops
- Run as the **user**, not a powerful service account

**Q7. A tool **fails**, or the model **invents** a tool call. How do you handle it?**

- Return the **error as the tool result**
- The model can then **correct itself**
- Reject **unknown tool names**
- Use **idempotency keys** so retries do not repeat side effects
- **Trace** every tool call
- Cap steps and have a **fallback answer**


## 14 · Data Sync (CDC)

**Q1. What is **CDC (Change Data Capture)**?**

- It reads **inserts, updates, deletes** from the DB **log**
- It publishes them as **events**
- Downstream stores stay **in sync** automatically

**Q2. Why **CDC** instead of dual writes or nightly batch?**

- **Dual write**: one side can fail, data becomes **inconsistent**
- **Batch**: data is **stale** and the job is heavy
- **CDC**: **near real-time**, ordered, **no app code change**

**Q3. How do **Debezium** and **Kafka Connect** work together?**

- Debezium is a **source connector** on Kafka Connect
- It reads the Postgres **WAL** (or MySQL **binlog**)
- It publishes **before/after + operation** per table topic
- First an **initial snapshot**, then streaming

**Q4. How does a **table change** reach the **vector and graph** stores?**

- Debezium publishes to **Kafka**
- A consumer **re-chunks and re-embeds** the changed row
- It **upserts** the vector DB and updates **graph nodes and edges**
- Skip re-embedding if the **content hash** is unchanged

**Q5. What are the traps with **updates and deletes**?**

- A **delete** must remove the **vectors** too
- Handle **op 'd'** and **tombstones**
- An **update**: delete old chunks by source id, insert new ones
- Use **stable ids** (source id + chunk index)
- **Partition by primary key** to keep order

**Q6. What are the **operational risks** of CDC?**

- An unread **replication slot** makes **WAL grow** and fill the disk
- **Schema changes** can break consumers: use **Schema Registry**
- Watch **lag**: data is **eventually consistent**
- Plan the **initial snapshot** for big tables


## 15 · Context & Accounting

**Q1. What is the **context window**, and why count tokens?**

- It is the max tokens the model can read
- It covers **prompt + history + retrieved text + output**
- Over the limit: **silent truncation** or an error

**Q2. What is **JTokkit**, and how accurate is it?**

- A Java **tokenizer** library (OpenAI encodings)
- Count tokens **before** you send
- It is only **approximate** for Llama and other models
- Keep a **safety margin**
- Ollama returns exact counts: **prompt_eval_count**, **eval_count**

**Q3. What is a **sliding window**?**

- Keep the **latest N messages or tokens**
- Drop the **oldest** first
- Always keep the **system prompt**
- Better: **summarize** old turns

**Q4. How do you **budget a prompt**?**

- Budget = **context size - reserved output tokens**
- Split it: **system, history, chunks, question**
- Trim chunks by **score** until it fits
- Set Ollama **num_ctx** high enough: small defaults **silently truncate**

**Q5. How do you track tokens with **Micrometer MeterRegistry**?**

- Use a **Counter** like **llm.tokens**
- Tag it with **type (input/output), model, tenant**
- Add a **Timer** for latency
- Export to **Prometheus / Grafana**
- Avoid **high-cardinality** tags like user id

**Q6. How do you **cross-charge GPU cost** to tenants?**

- Cost per token = **GPU hourly cost / token throughput**
- Tenant bill = **tokens used x cost per token**
- Measure **GPU-seconds** if you can
- Add **quotas and budget alerts**
- Ties to **TPM limits** (component 7)


## 16 · Hardware Math

**Q1. What is **SIMD**?**

- **One CPU instruction works on many values**
- It uses a wide **vector register**
- Perfect for loops over **float arrays** like embeddings

**Q2. What is the **Java Vector API**, and what is **JEP 508**?**

- An API in **jdk.incubator.vector** for SIMD code
- **JEP 508** is its **tenth incubator** (JDK 25)
- Still **incubating**: the API can change
- Run with **--add-modules jdk.incubator.vector**

**Q3. Why do embeddings need it?**

- Cosine or dot product over **768-1536 floats**
- Repeated for **millions** of vectors
- Scalar loop: **one float per step**
- Vector API: **8-16 floats per step**

**Q4. How does a **dot product** look with the Vector API?**

- **SPECIES = FloatVector.SPECIES_PREFERRED**
- Loop in steps of **SPECIES.length()**
- Load a and b, then **acc = a.fma(b, acc)**
- End with **reduceLanes(ADD)**
- Handle leftovers with a **scalar tail loop**

**Q5. Why not trust **JIT auto-vectorization**?**

- C2 vectorizes **simple loops**, not all of them
- **Float reductions** often fail: strict FP order
- The explicit API gives **control**
- Always **verify with JMH**

**Q6. When do you use it, and when not?**

- Use it for **in-JVM similarity, re-scoring, reranking**
- Skip it if **pgvector** already runs the ANN search
- Use a **GPU** for very large batches
- Costs: **incubator flag, portability, tail handling**
- **Normalize vectors** so dot product = cosine; **benchmark vs scalar**

