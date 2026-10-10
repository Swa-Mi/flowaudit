export const SCENARIOS = [
  {
    id: 'algo-bottleneck',
    title: 'Order Reconciliation (O(n²) Bottleneck & Dictionary Lookup)',
    filename: 'services/order_reconciliation.ts',
    language: 'typescript',
    branch: 'feat/reconcile-batches',
    prNumber: 418,
    highlightRange: [11, 28],
    defaultVoiceTranscript: "By the way this loop has an O(n^2) bottleneck. Suggest swapping this dictionary lookup to a hash set and adding early returns for null checks like this.",
    bluntVoiceTranscript: "Ugh this loop is completely awful, it's doing an O(n^2) scan on every single transaction! Why are we doing a dictionary lookup inside a loop when it's gonna crash if the batch is null? Swap to a hash set and add early guard returns.",
    code: `import { Transaction, UserAccount, ReconciliationResult } from '../types';

export class OrderReconciler {
  private userCatalog: Map<string, UserAccount>;

  constructor(userCatalog: Map<string, UserAccount>) {
    this.userCatalog = userCatalog;
  }

  public reconcileBatch(
    transactions: Transaction[] | null,
    targetDate: string
  ): ReconciliationResult {
    // Audit warning: quadratic complexity and missing input guards
    const matched: Transaction[] = [];
    const anomalies: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      let accountFound = false;

      // Scanning entire catalog keys on every iteration: O(N * M) bottleneck!
      for (const [userId, account] of this.userCatalog.entries()) {
        if (userId === tx.userId && account.isActive) {
          accountFound = true;
          break;
        }
      }

      if (accountFound && tx.amount > 0) {
        matched.push(tx);
      } else {
        anomalies.push(tx);
      }
    }

    return {
      total: transactions.length,
      matched,
      anomalies,
      timestamp: Date.now()
    };
  }
}`,
    suggestedReplacement: `  public reconcileBatch(
    transactions: Transaction[] | null,
    targetDate: string
  ): ReconciliationResult {
    // 1. Guard against null or empty transaction batches
    if (!transactions || transactions.length === 0) {
      return { total: 0, matched: [], anomalies: [], timestamp: Date.now() };
    }

    // 2. Pre-index active user IDs in an O(1) Set to eliminate O(N^2) bottleneck
    const activeUserIds = new Set<string>();
    for (const [userId, account] of this.userCatalog.entries()) {
      if (account.isActive) activeUserIds.add(userId);
    }

    const matched: Transaction[] = [];
    const anomalies: Transaction[] = [];

    // 3. Single-pass linear scan with O(1) membership check
    for (const tx of transactions) {
      if (!tx) continue;

      if (activeUserIds.has(tx.userId) && tx.amount > 0) {
        matched.push(tx);
      } else {
        anomalies.push(tx);
      }
    }`,
    tones: {
      diplomatic: {
        title: "Diplomatic & Mentoring",
        description: "Encouraging, explains the algorithmic impact clearly, and gives credit before suggesting the fix.",
        comment: `### 🔍 Performance & Null-Safety Recommendation

Thanks for putting this batch reconciliation together! The core business logic handles the state transitions nicely.

Looking at lines 14–28, the nested loop ` + "`for (const [userId, account] of this.userCatalog.entries())`" + ` produces an **$O(N \\times M)$ quadratic bottleneck** on every reconciliation run. At peak traffic (e.g. 10k transactions with 50k users), this could stall the event loop.

We can optimize this down to **$O(N + M)$ linear time** by pre-collecting active user IDs into a ` + "`Set`" + ` before the loop, and we can also add an upfront guard check for null transaction batches:`,
        scoreMetrics: {
          politeness: 98,
          clarity: 96,
          actionability: 100,
          constructiveness: 99
        }
      },
      direct: {
        title: "Direct & Concise",
        description: "High-signal, to-the-point review comment favored in fast-paced production teams.",
        comment: `### ⚡ O(n²) Bottleneck & Null Guard

- **Complexity**: Lines 18–26 do a linear catalog scan inside the transaction loop, degrading to $O(n^2)$.
- **Fix**: Pre-populate a ` + "`Set<string>`" + ` of active users for $O(1)$ lookups.
- **Safety**: Added early return on ` + "`!transactions`" + ` to avoid null pointer dereferencing on line 18.

Suggested refactor:`,
        scoreMetrics: {
          politeness: 88,
          clarity: 98,
          actionability: 100,
          constructiveness: 92
        }
      },
      architect: {
        title: "Senior Staff Architect",
        description: "Focuses on operational resilience, SLA latency budgets, and defensive invariants.",
        comment: `### 🏛️ Operational Resilience & Algorithmic Scalability Review

Reviewing from a system throughput standpoint:
1. **Algorithmic Complexity**: Re-evaluating ` + "`this.userCatalog`" + ` per element breaks our sub-50ms p99 SLA under standard batch payloads ($O(N \\cdot M)$).
2. **Defensive Invariant**: Missing defensive contract validation on ` + "`transactions`" + ` risks crashing the reconciliation worker.

By materializing an ephemeral active user ` + "`Set`" + ` upfront, we constrain memory overhead while guaranteeing linear $O(N)$ execution time.`,
        scoreMetrics: {
          politeness: 92,
          clarity: 95,
          actionability: 98,
          constructiveness: 96
        }
      },
      socratic: {
        title: "Socratic & Collaborative",
        description: "Guides the author through questions while offering the complete code solution.",
        comment: `### 💡 Question on Scaling & Suggestion

Great start on this! One thought on the scaling characteristics: as our user base and transaction volumes expand, what do you think about avoiding the nested iteration over ` + "`userCatalog`" + `?

If we swap this to an active ID ` + "`Set`" + ` and guard against null batches upfront, we can turn this into a quick $O(1)$ lookup per item. Here's what that might look like:`,
        scoreMetrics: {
          politeness: 96,
          clarity: 92,
          actionability: 95,
          constructiveness: 97
        }
      }
    }
  },
  {
    id: 'async-waterfall',
    title: 'Payment Gateway (Async Waterfall & Leaking Socket)',
    filename: 'lib/payments/processor.ts',
    language: 'typescript',
    branch: 'fix/payment-settlement',
    prNumber: 422,
    highlightRange: [14, 30],
    defaultVoiceTranscript: "This async loop is executing requests sequentially creating an unnecessary waterfall. Suggest switching to Promise.allSettled with chunking and adding a try-finally to close the client handle.",
    bluntVoiceTranscript: "Why are we awaiting each payment one by one? This is agonizingly slow. And if one throws an exception the socket handle never gets closed. Use Promise.allSettled and a try-finally block.",
    code: `import { PaymentIntent, GatewayClient, SettlementReport } from './gateway';

export async function settleAllPayments(
  intents: PaymentIntent[],
  client: GatewayClient
): Promise<SettlementReport> {
  const settledIds: string[] = [];
  const errors: Error[] = [];

  // Connect client to gateway endpoint
  await client.connect();

  // Waterfall bottleneck: awaiting one network request at a time
  for (let i = 0; i < intents.length; i++) {
    const item = intents[i];
    try {
      const response = await client.capturePayment(item.id, item.amount);
      if (response.status === 'success') {
        settledIds.push(item.id);
      }
    } catch (err) {
      errors.push(err as Error);
    }
  }

  // Socket remains unclosed if an unexpected error occurs higher up!
  await client.disconnect();

  return { settledIds, errors, total: intents.length };
}`,
    suggestedReplacement: `  // Connect client to gateway endpoint
  await client.connect();

  try {
    // Parallelize with Promise.allSettled to eliminate sequential network waterfall
    const results = await Promise.allSettled(
      intents.map(item => client.capturePayment(item.id, item.amount))
    );

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.status === 'fulfilled' && res.value.status === 'success') {
        settledIds.push(intents[i].id);
      } else if (res.status === 'rejected') {
        errors.push(res.reason as Error);
      }
    }
  } finally {
    // Ensure socket handle is always reclaimed even on failure
    await client.disconnect().catch(console.error);
  }`,
    tones: {
      diplomatic: {
        title: "Diplomatic & Mentoring",
        description: "Polite review explaining network concurrency and socket cleanup.",
        comment: `### 🌐 Network Throughput & Resource Safety

Nicely structured payment handler! To significantly cut down latency when processing batches of payments, we can execute the settlement calls concurrently rather than serially. 

Also wrapping the processing in a ` + "`try...finally`" + ` ensures the ` + "`client.disconnect()`" + ` cleanup hook always runs even if an unhandled promise rejection occurs:`,
        scoreMetrics: {
          politeness: 97,
          clarity: 98,
          actionability: 100,
          constructiveness: 99
        }
      },
      direct: {
        title: "Direct & Concise",
        description: "Brief callout for network waterfall and resource leak.",
        comment: `### ⚡ Concurrency & Cleanup Optimization

- Replace serial ` + "`for...await`" + ` with ` + "`Promise.allSettled`" + ` to avoid $N \\times RTT$ network latency.
- Move ` + "`client.disconnect()`" + ` to a ` + "`finally`" + ` block to prevent leaked socket connections on exception.`,
        scoreMetrics: {
          politeness: 90,
          clarity: 99,
          actionability: 100,
          constructiveness: 94
        }
      },
      architect: {
        title: "Senior Staff Architect",
        description: "Focus on connection pool saturation and failure blast radius.",
        comment: `### 🏛️ Gateway Client Concurrency & Connection Life Cycle

Executing sequential awaits introduces high latency variance for multi-intent transactions. Furthermore, decoupling ` + "`client.disconnect()`" + ` from an unwound stack risks connection pool exhaustion. 

Leveraging ` + "`Promise.allSettled`" + ` preserves independent failure domains while ` + "`finally`" + ` guarantees deterministic socket de-allocation:`,
        scoreMetrics: {
          politeness: 94,
          clarity: 96,
          actionability: 98,
          constructiveness: 95
        }
      },
      socratic: {
        title: "Socratic & Collaborative",
        description: "Asks about network latency budget and connection teardown.",
        comment: `### 💡 Thought on Gateway Concurrency

Have you considered running these captures concurrently via ` + "`Promise.allSettled`" + `? That would drop total time from sum-of-latencies to max-latency. Also, using a ` + "`finally`" + ` block guarantees that ` + "`client.disconnect()`" + ` is called even if an error is thrown:`,
        scoreMetrics: {
          politeness: 95,
          clarity: 94,
          actionability: 96,
          constructiveness: 97
        }
      }
    }
  },
  {
    id: 'race-condition',
    title: 'Cache Invalidation (Race Condition & Lock Contention)',
    filename: 'pkg/cache/memory_store.go',
    language: 'go',
    branch: 'feat/sharded-cache',
    prNumber: 435,
    highlightRange: [8, 22],
    defaultVoiceTranscript: "This cache lookup has a time-of-check to time-of-use race condition. Suggest wrapping the read and eviction in a read-write mutex with defer unlock, and returning early on cache hits.",
    bluntVoiceTranscript: "There's a massive race condition here! Goroutines will clobber each other's cache entries because there's no mutex lock before the map read. Add a sync.RWMutex with defer and return early.",
    code: `package cache

import (
	"time"
)

type CacheItem struct {
	Value     interface{}
	ExpiresAt time.Time
}

type MemoryStore struct {
	items map[string]CacheItem
	// Warning: Concurrent goroutine access without synchronization lock
}

func (m *MemoryStore) GetOrCompute(key string, compute func() (interface{}, error)) (interface{}, error) {
	// Unsynchronized map access: causes concurrent map read/write fatal crash
	item, exists := m.items[key]
	if exists && time.Now().Before(item.ExpiresAt) {
		return item.Value, nil
	}

	val, err := compute()
	if err != nil {
		return nil, err
	}

	m.items[key] = CacheItem{
		Value:     val,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	return val, nil
}`,
    suggestedReplacement: `type MemoryStore struct {
	mu    sync.RWMutex
	items map[string]CacheItem
}

func (m *MemoryStore) GetOrCompute(key string, compute func() (interface{}, error)) (interface{}, error) {
	// 1. Fast-path: Read lock for concurrent safe access
	m.mu.RLock()
	item, exists := m.items[key]
	if exists && time.Now().Before(item.ExpiresAt) {
		m.mu.RUnlock()
		return item.Value, nil
	}
	m.mu.RUnlock()

	// 2. Slow-path: Acquire write lock before computing and mutating
	m.mu.Lock()
	defer m.mu.Unlock()

	// Double-check existence after acquiring write lock
	if item, exists := m.items[key]; exists && time.Now().Before(item.ExpiresAt) {
		return item.Value, nil
	}

	val, err := compute()
	if err != nil {
		return nil, err
	}

	m.items[key] = CacheItem{
		Value:     val,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	return val, nil
}`,
    tones: {
      diplomatic: {
        title: "Diplomatic & Mentoring",
        description: "Gentle review explaining Go concurrent map panics and standard double-checked locking.",
        comment: `### 🛡️ Concurrency Safety: Read-Write Mutex & Double-Checked Locking

Great clean cache interface! In Go, concurrent reads and writes to an un-synchronized ` + "`map`" + ` can trigger a runtime fatal panic (` + "`concurrent map read and map write`" + `).

To make this safe across goroutines while maintaining high read throughput, we can guard the map with a ` + "`sync.RWMutex`" + ` using a fast-path read lock followed by double-checked write locking:`,
        scoreMetrics: {
          politeness: 98,
          clarity: 97,
          actionability: 100,
          constructiveness: 99
        }
      },
      direct: {
        title: "Direct & Concise",
        description: "Direct callout of Go fatal concurrent map crash.",
        comment: `### ⚠️ Fatal Race Condition on Unsynchronized Map

` + "`m.items`" + ` is accessed without synchronization. In Go, simultaneous reads and writes to maps cause unrecoverable runtime crashes.

Add ` + "`sync.RWMutex`" + ` with double-checked locking pattern:`,
        scoreMetrics: {
          politeness: 89,
          clarity: 98,
          actionability: 100,
          constructiveness: 93
        }
      },
      architect: {
        title: "Senior Staff Architect",
        description: "Concurrency correctness and cache stampede protection.",
        comment: `### 🏛️ Concurrency Invariant Violation

Unsynchronized map access violates the Go memory model and will induce kernel-level aborts under multi-threaded load. 

Implementing ` + "`sync.RWMutex`" + ` with double-checked validation satisfies thread safety while minimizing write lock contention on warm cache hits:`,
        scoreMetrics: {
          politeness: 93,
          clarity: 97,
          actionability: 99,
          constructiveness: 97
        }
      },
      socratic: {
        title: "Socratic & Collaborative",
        description: "Asks about concurrent goroutine access to map.",
        comment: `### 💡 Thread Safety Question

When multiple goroutines call ` + "`GetOrCompute`" + ` in parallel, how should we protect ` + "`m.items`" + ` against Go's fatal concurrent map mutation crash?

Here's an idiomatic approach using ` + "`sync.RWMutex`" + ` with double-checked locking:`,
        scoreMetrics: {
          politeness: 96,
          clarity: 94,
          actionability: 96,
          constructiveness: 97
        }
      }
    }
  },
  {
    id: 'custom-buffer',
    title: '⚡ Your VS Code Project (Paste & Review Custom Code)',
    filename: 'src/controllers/auth_handler.ts',
    language: 'typescript',
    branch: 'feat/my-feature',
    prNumber: 501,
    highlightRange: [5, 18],
    defaultVoiceTranscript: "This lookup has an O(n^2) bottleneck and missing null checks. Suggest swapping this search to a Set and adding early returns.",
    bluntVoiceTranscript: "Why are we doing a full scan on every item? This will blow up production under load. Rip it out, use a Set, and add guard checks right at the top.",
    code: `import { Request, Response } from 'express';

export async function handleUserPermissions(req: Request, res: Response) {
  const { userList, activeRoles } = req.body;
  // Audit review target: unvalidated input & linear search in loop
  const authorized = [];

  for (let i = 0; i < userList.length; i++) {
    const user = userList[i];
    let hasRole = false;

    // Linear scanning activeRoles array on every user
    for (let j = 0; j < activeRoles.length; j++) {
      if (user.roleId === activeRoles[j].id && activeRoles[j].enabled) {
        hasRole = true;
        break;
      }
    }

    if (hasRole) {
      authorized.push(user.id);
    }
  }

  return res.json({ success: true, authorized });
}`,
    suggestedReplacement: `  // 1. Guard against null or missing inputs
  if (!userList || !activeRoles) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  // 2. Pre-index enabled roles into a Set for O(1) membership check
  const enabledRoleIds = new Set(
    activeRoles.filter(r => r.enabled).map(r => r.id)
  );

  const authorized = [];
  for (const user of userList) {
    if (user && enabledRoleIds.has(user.roleId)) {
      authorized.push(user.id);
    }
  }`,
    tones: {
      diplomatic: {
        title: "Diplomatic & Mentoring",
        description: "Respectful, explains the algorithmic impact clearly and gives credit.",
        comment: `### 🔍 Performance & Guard Validation Review

Nice clean endpoint structure! Looking closely at the permission evaluation logic, the nested ` + "`for`" + ` loop produces an $O(N \\times M)$ complexity bottleneck when processing larger user lists.

We can streamline this into linear $O(N + M)$ time by caching enabled role IDs in a ` + "`Set`" + ` before the loop, and adding an early null guard:`,
        scoreMetrics: {
          politeness: 98,
          clarity: 96,
          actionability: 100,
          constructiveness: 99
        }
      },
      direct: {
        title: "Direct & Concise",
        description: "High-signal, to-the-point review comment.",
        comment: `### ⚡ Complexity & Guard Recommendation

- **Bottleneck**: Nested loop causes quadratic lookup time ($O(n^2)$).
- **Fix**: Index ` + "`activeRoles`" + ` in a ` + "`Set`" + ` for $O(1)$ lookups.
- **Safety**: Guard against missing payload properties upfront.`,
        scoreMetrics: {
          politeness: 88,
          clarity: 98,
          actionability: 100,
          constructiveness: 92
        }
      },
      architect: {
        title: "Senior Staff Architect",
        description: "Focus on latency SLOs and defensive API contracts.",
        comment: `### 🏛️ API Gateway Latency & Input Validation Review

Evaluating from a throughput standpoint:
1. Quadratic role scans violate our sub-10ms response time budget on batch requests.
2. Unvalidated request properties risk throwing unhandled TypeError exceptions in the worker.

Refactored with defensive payload validation and an ephemeral lookup Set:`,
        scoreMetrics: {
          politeness: 92,
          clarity: 95,
          actionability: 98,
          constructiveness: 96
        }
      },
      socratic: {
        title: "Socratic & Collaborative",
        description: "Guides through thoughtful questions.",
        comment: `### 💡 Question on Scaling Characteristics

What do you think about avoiding the nested iteration over ` + "`activeRoles`" + ` as this list scales?

By indexing the IDs into a ` + "`Set`" + ` and checking for null payloads early, we can get constant-time lookups:`,
        scoreMetrics: {
          politeness: 96,
          clarity: 92,
          actionability: 95,
          constructiveness: 97
        }
      }
    }
  }
];
