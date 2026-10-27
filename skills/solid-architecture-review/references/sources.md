# Sources and interpretation

Verified on 2026-10-27. These links point to original authors or academic copies of
primary papers. The skill's review probes, examples, and workflow are an original
practical synthesis. No source establishes a universal maximum file size, directory
size, layer count, or interface count.

| Source | Contribution and limit |
| --- | --- |
| David L. Parnas, [On the Criteria To Be Used in Decomposing Systems into Modules](https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf), CMU technical report, 1971; journal version published in 1972 | Information hiding and decomposition around design decisions. Does not prescribe a modern folder template. |
| Robert C. Martin, [The Single Responsibility Principle](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html), 2014 | Responsibility as coherent reasons for change. Does not mean one method per class. |
| Robert C. Martin, [The Open Closed Principle](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html), 2014, and [An Open and Closed Case](https://blog.cleancoder.com/uncle-bob/2013/03/08/AnOpenAndClosedCase.html), 2013 | Stable extension boundaries and the limits of interpreting OCP literally. Does not require a plugin system for every application. |
| Barbara H. Liskov and Jeannette M. Wing, [A Behavioral Notion of Subtyping](https://www.cs.cmu.edu/Groups/venari/subtype-toplas.html), ACM TOPLAS, 1994 | Behavioral compatibility of subtypes, beyond signatures. |
| Robert C. Martin, [Design Principles and Design Patterns](https://staff.cs.utu.fi/~jounsmed/doos_06/material/DesignPrinciplesAndPatterns.pdf), 2000 | Dependency-oriented principles, including ISP and DIP. Application should follow the target language's idioms. |
| Martin Fowler, [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html), 2004 | Separating construction/configuration from use. Dependency injection does not require a container. |
| Martin Fowler, [Refactoring Module Dependencies](https://martinfowler.com/articles/refactoring-dependencies.html), 2015 | Incremental modular refactoring and local comprehension, demonstrated in Java and JavaScript. |
| Martin Fowler, [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html), 2014 | Explicit model boundaries and integration between differing meanings. Does not require microservices. |
| Martin Fowler, [Yagni](https://martinfowler.com/bliki/Yagni.html), 2015 | Avoid speculative capability while retaining the ability to evolve code. |

Use the repository's actual architecture decisions and current official framework
documentation for framework-specific questions. A named principle is a lens for
investigation; every reported finding still needs target-specific evidence.
