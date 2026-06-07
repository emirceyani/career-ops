# Story Bank — Master STAR+R Stories

This file accumulates your best interview stories over time. Each evaluation (Block F) adds new stories here. Instead of memorizing 100 answers, maintain 5-10 deep stories that you can bend to answer almost any behavioral question.

## How it works

1. Every time `/career-ops oferta` generates Block F (Interview Plan), new STAR+R stories get appended here
2. Before your next interview, review this file — your stories are already organized by theme
3. The "Big Three" questions can be answered with stories from this bank:
   - "Tell me about yourself" → combine 2-3 stories into a narrative
   - "Tell me about your most impactful project" → pick your highest-impact story
   - "Tell me about a conflict you resolved" → find a story with a Reflection

## Stories

<!-- Format:
### [Theme] Story Title
**Source:** Report #NNN — Company — Role
**S / T / A / R / Reflection / Best for questions about:**
-->

### [Build & Ship] FALCON — End-to-End Analog Circuit Design in < 1s
**Source:** Report #071 — Zillow — Principal MLE, Agentic AI
**S (Situation):** Analog circuit design requires weeks of expert labor — topology selection, parameter tuning, layout constraint satisfaction.
**T (Task):** Automate the full pipeline end-to-end with no manual tuning, from topology to production-ready parameters.
**A (Action):** Built an edge-centric GNN to predict circuit performance from topology + parameters; connected it to gradient-based parameter optimization under differentiable layout constraints.
**R (Result):** < 1 second per design, full automation. Published in NeurIPS 2025. Qualcomm Innovation Fellowship finalist.
**Reflection:** Moving fast without sacrificing correctness requires building the right abstraction layer first — not just iterating on a broken one. The system works because the GNN model and the optimizer share the same differentiable substrate; speed is a property of the architecture, not of cutting corners.
**Best for questions about:** build-and-ship culture, research-to-production, end-to-end system design, automation, NeurIPS publication.

### [Mentorship / Benchmark] FedGraphNN — Teaching by Building
**Source:** Report #071 — Zillow — Principal MLE, Agentic AI
**S (Situation):** No standardized benchmark existed for federated GNN research, making results impossible to compare across papers.
**T (Task):** Co-build the first federated GNN benchmark while mentoring junior collaborators through the process.
**A (Action):** Designed 36 datasets × 7 GNN architectures × 9 FL algorithms; built open-source platform with MLOps support; published at ICLR-DPML + MLSys-GNNSys 2021.
**R (Result):** Widely cited; platform adopted by the community.
**Reflection:** Teaching by building forces collaborators to think about experimental protocol design, not just model tuning. The benchmark is a mentorship artifact — it enforces rigor on everyone who uses it.
**Best for questions about:** mentorship, technical leadership, open-source impact, cross-team collaboration, research infrastructure.

### [RL / Diversity] Diversity-Seeking RL for Diffusion Models
**Source:** Report #056 — Vmax — MTS, RL Algorithms
**S (Situation):** Mode collapse is a known failure mode in generative RL reward design — models converge to a narrow mode of the output distribution rather than exploring it.
**T (Task):** Design a diversity-aware RL objective that penalizes low-coverage trajectories and prevents mode collapse in diffusion model generation.
**A (Action):** Created a reward function balancing fidelity (quality) and coverage (diversity) across the generation distribution; submitted as a working paper.
**R (Result):** Measurable coverage improvement over baseline reward designs; working paper submitted.
**Reflection:** The failure mode I studied (mode collapse) maps directly to reward hacking in LLM post-training. Framing diversity-seeking RL as a solution to reward pathologies — not just a generative modeling tool — is the right way to position this work to RL-for-LLM labs.
**Best for questions about:** novel RL algorithm development, reward design, mode collapse, diversity vs. fidelity trade-offs, open-ended learning.

### [RL / Sample Efficiency] Conformal Prediction for LLM Fine-Tuning
**Source:** Report #056 — Vmax — MTS, RL Algorithms
**S (Situation):** LLM calibration and uncertainty-aware fine-tuning typically requires a large calibration set — impractical in low-data or domain-shift regimes.
**T (Task):** Build an uncertainty-aware fine-tuning method that eliminates the separate post-hoc calibration step.
**A (Action):** Developed a novel conformal-prediction-based training objective that provides statistical coverage guarantees during fine-tuning without a separate calibration phase.
**R (Result):** Reduced calibration data requirements; improved uncertainty coverage in open-ended tasks; working paper in progress.
**Reflection:** Sample efficiency in post-training is not just about data volume — it is about how efficiently each training signal updates the model's uncertainty representation. Conformal guarantees make this rigorous.
**Best for questions about:** LLM post-training, sample efficiency, uncertainty quantification, rigorous evaluation metrics.

### [Relational ML] FedGrAINS — Personalized Subgraph Federated Learning
**Source:** Reports #031 (Granica), #037 (Cosmic Labs)
**S (Situation):** Federated setting with heterogeneous, graph-structured relational data spread across institutional silos; standard aggregation breaks under graph heterogeneity.
**T (Task):** Design adaptive representation learning that generalizes across relational structures without sharing raw data.
**A (Action):** Derived an adaptive neighbor-sampling criterion driven by local graph statistics, with per-node statistical guarantees; implemented in PyTorch Geometric as personalized subgraph federated learning.
**R (Result):** Oral presentation at SIAM SDM'25 (26.7% acceptance); deployed into the FedML library.
**Reflection:** Relational structure is the strongest inductive bias in ML — the representation must encode structural *uncertainty*, not just local topology. Analytical tools from one domain often solve problems in an adjacent one.
**Best for questions about:** representation learning for structured/relational data, custom-algorithm design, distributed/federated ML, handling heterogeneity, statistical rigor in systems.

### [Architecture] FALCON — Relational + Symbolic + Neural Circuit Design
**Source:** Reports #031 (Granica), #037 (Cosmic Labs)
**S (Situation):** Analog/RF circuit design was bottlenecked by human experts; no end-to-end ML system existed for the full design loop.
**T (Task):** Automate topology selection through layout optimization with one trainable ML pipeline.
**A (Action):** Built a GNN (relational) + LLM (symbolic/neural) pipeline with domain-specific edge/node features from SPICE simulations; co-led the system end to end.
**R (Result):** NeurIPS'25 main track; Qualcomm Innovation Fellowship NA finalist.
**Reflection:** Building the full loop first exposes cross-stage failure modes invisible at the component level; feature engineering is ~70% domain knowledge — talk to the hardware engineers early.
**Best for questions about:** most-impactful project, integrating relational/symbolic/neural components, end-to-end system design, feature engineering for complex data, cross-disciplinary collaboration.

### [Uncertainty] Conformal Prediction for Calibrated LLM Fine-Tuning
**Source:** Reports #031 (Granica), #037 (Cosmic Labs)
**S (Situation):** LLM fine-tuning lacked reliable uncertainty quantification; post-hoc calibration needs extra calibration data and steps.
**T (Task):** Bake distribution-free statistical guarantees into training without post-hoc calibration.
**A (Action):** Applied conformal-prediction theory to restructure the fine-tuning objective so coverage guarantees hold without separate calibration data.
**R (Result):** Under-review paper; directly transferable to any setting needing calibrated, actionable predictions (e.g., infrastructure failure bounds).
**Reflection:** Uncertainty should be a training-time property — post-hoc calibration is a symptom of an underspecified objective. The statistics literature often already has the answer ML hasn't imported yet.
**Best for questions about:** calibrated uncertainty quantification, statistical learning theory, distribution-free guarantees, making predictions operators can act on, cross-domain reading as a moat.

### [Infrastructure] FedGraphNN — First Federated GNN Benchmark
**Source:** Reports #031 (Granica), #037 (Cosmic Labs)
**S (Situation):** No standardized benchmark existed for federated GNN training; every paper used different datasets, splits, and protocols.
**T (Task):** Build the evaluation infrastructure the whole community could standardize on.
**A (Action):** Designed FedGraphNN — 36 scenarios, 8 algorithms, standardized datasets/splits/eval protocols, coordinating 5 institutions; released as open software.
**R (Result):** Foundational, widely-cited benchmark; integrated into the FedML library (ICLR-DPML + MLSys-GNNSys 2021).
**Reflection:** Benchmark infrastructure compounds — more long-term impact per unit effort than one-off papers. Open-sourcing early created a virtuous cycle I underestimated.
**Best for questions about:** reproducible evaluation frameworks, building from scratch, open-source/community impact, experimental rigor, coordinating across teams.

### [Time-Series] Turkcell — GP + ConvLSTM on Nationwide Telemetry
**Source:** Report #037 (Cosmic Labs)
**S (Situation):** A nationwide mobile base-station network had uneven, noisy traffic; over/under-provisioning wasted capacity.
**T (Task):** Forecast base-station-level traffic and model spatiotemporal patterns on real operational telemetry.
**A (Action):** Built Graph Convolutional Networks + Gaussian Processes and ConvLSTM models on large-scale structured/sequential telemetry; engineered features from high-frequency network logs.
**R (Result):** Production-deployed; enabled proactive resource allocation.
**Reflection:** Real operational data is far messier than academic datasets — cleaning time exceeded modeling time. Probabilistic time-series models (GP) give forecasts *and* uncertainty, which is what operators actually need.
**Best for questions about:** time-series/forecasting on real telemetry, probabilistic forecasting, high-dimensional sequential feature engineering, deploying ML in production, working with noisy data.

### [Rare Events] GFlowNets — Sampling Low-Probability Regions
**Source:** Reports #031, #037
**S (Situation):** Many high-value ML problems (scientific discovery, rare-event/failure prediction) require efficiently exploring low-probability regions of large discrete spaces.
**T (Task):** Design learned stochastic samplers that don't let the common case drown the rare signal.
**A (Action):** Spent ~2 years on GFlowNet-based methods (incl. reward-driven graph synthesis for cross-silo federated learning) that sample proportionally to reward over discrete structures.
**R (Result):** Working paper; directly reframable as rare-event / imbalanced-failure modeling.
**Reflection:** Amortizing inference is a transferable technique for any long-horizon predictive task. Rare-event sampling and imbalanced prediction are the same problem viewed from two angles.
**Best for questions about:** rare-event / imbalanced prediction, stochastic processes, exploration of large discrete spaces, sampling methods, scientific discovery.

### [Optimization] LLM-Guided Bayesian Optimization with Amortized Inference
**Source:** Reports #031, #037
**S (Situation):** Scientific-discovery search spaces are exponentially large; classical Bayesian optimization doesn't scale with LLM priors.
**T (Task):** Make expensive BO inference tractable for accelerated, AI-driven discovery.
**A (Action):** Modeled the acquisition function with amortized approximate inference, guided by LLM priors.
**R (Result):** Working paper; faster iteration on scientific hypothesis generation.
**Reflection:** Amortization of inference transfers to any long-horizon predictive task — the cost is paid once, then queried cheaply.
**Best for questions about:** Bayesian methods, optimization for ML, probabilistic modeling, scalable inference, long-horizon prediction under uncertainty.

### [Systems] FedML @ TensorOpera — Link-Level Differential Privacy in Production
**Source:** Report #031 (Granica)
**S (Situation):** TensorOpera needed production-ready federated GNN training with privacy guarantees for external clients.
**T (Task):** Build a platform researchers *and* engineers could deploy on real distributed structured datasets.
**A (Action):** Built a link-level differential-privacy algorithm for subgraph federated learning; integrated it into the FedML library for external use.
**R (Result):** Platform in production; algorithm published and adopted by the engineering team.
**Reflection:** Algorithm simplicity is an engineering constraint, not a compromise — that discipline makes the research more rigorous, not less. Federated compression and learning quality are the same trade-off from different layers.
**Best for questions about:** distributed/scalable ML systems, research-to-production, privacy/DP, information efficiency, working across research and engineering.
