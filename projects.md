# Projects

<!-- ============================================================
     USER LAYER — NEVER auto-updated.
     Lists open-source research projects with GitHub links.
     The pdf mode reads this file to populate {{PROJECTS}} in the CV template.

     For each project, include:
       - title, description, github, paper (URL), tags, tech stack
     Tags are for routing — used to select top 3-4 projects per JD.

     TAG TAXONOMY:
       federated-learning | graph-neural-networks | generative-models
       medical-imaging | mri | ai4science | circuit-design
       llm | agentic-ai | bayesian | benchmarking | systems
       reinforcement-learning | gflownets | privacy | personalization
     ============================================================ -->

---

## [FedGraphNN] Federated Learning System and Benchmark for Graph Neural Networks

- **GitHub:** https://github.com/FedML-AI/FedGraphNN
- **Paper:** https://arxiv.org/abs/2104.07145
- **Venue:** DPML Workshop @ ICLR 2021 · GNNSys Workshop @ MLSys 2021
- **Role:** Co-first author, co-creator
- **Stars:** 184
- **Tags:** `federated-learning` `graph-neural-networks` `benchmarking` `systems` `privacy`
- **Tech:** Python, PyTorch Geometric, FedML
- **Description:** First federated GNN benchmarking study. Covers 36 datasets, 7 GNN architectures, and 9 federated algorithms across molecular, social, and knowledge-graph domains. Open-source platform with MLOps support.
- **Best for JDs mentioning:** federated learning, graph neural networks, ML systems, benchmarking, open-source research, distributed ML, privacy-preserving learning

---

## [SpreadGNN] Serverless Multi-Task Federated Learning for Graph Neural Networks

- **GitHub:** https://github.com/FedML-AI/SpreadGNN
- **Paper:** https://ojs.aaai.org/index.php/AAAI/article/view/20643
- **Venue:** AAAI 2022 (acceptance rate 15%)
- **Role:** Co-first author
- **Tags:** `federated-learning` `graph-neural-networks` `multi-task-learning` `systems` `serverless`
- **Tech:** Python, PyTorch Geometric, FedML
- **Description:** Serverless federated framework for multi-task GNN training. Eliminates the central server requirement; supports heterogeneous graph tasks across decentralized clients.
- **Best for JDs mentioning:** federated learning, GNNs, multi-task learning, distributed systems, decentralized learning, serverless ML

---

## [FALCON] Fully Automated Layout-Constrained Analog Circuit Design

- **GitHub:** https://github.com/AsalMehradfar/FALCON
- **Paper:** https://arxiv.org/abs/2505.21923
- **Venue:** NeurIPS 2025 (Main Track)
- **Role:** Co-author
- **Stars:** 45
- **Tags:** `ai4science` `circuit-design` `graph-neural-networks` `differentiable-optimization`
- **Tech:** Python, PyTorch, GNNs, Differentiable Optimization
- **Description:** End-to-end ML framework using an edge-centric GNN performance model and gradient-based optimization to automate analog circuit topology selection and layout-constrained parameter design (under 1s per design).
- **Best for JDs mentioning:** AI for science/engineering, circuit design automation, EDA, GNNs, differentiable optimization, hardware AI

---

## [FedGrAINS] Personalized Subgraph Federated Learning with Adaptive Neighbor Sampling

- **GitHub:** https://github.com/Oxfordblue7/FedGrAINS
- **Paper:** https://arxiv.org/abs/2501.12592
- **Venue:** SIAM International Conference on Data Mining (SDM 2025), oral (acceptance rate 26.7%)
- **Role:** First author
- **Tags:** `federated-learning` `graph-neural-networks` `gflownets` `reinforcement-learning` `personalization` `privacy` `distributed-learning`
- **Tech:** Python, PyTorch Geometric, GFlowNets
- **Description:** Uses GFlowNets to estimate node importance and adapt GNN message passing for personalized subgraph federated learning. Produces per-client models that handle missing links and heterogeneous subgraphs while keeping data local.
- **Best for JDs mentioning:** federated learning, graph neural networks, GFlowNets, reinforcement learning, personalization, distributed ML, privacy-preserving learning, subgraph methods

---

## [FedGIMP] Federated Learning of Generative Image Priors for MRI Reconstruction

- **GitHub:** https://github.com/icon-lab/FedGIMP
- **Paper:** https://ieeexplore.ieee.org/abstract/document/9943293
- **Venue:** IEEE Transactions on Medical Imaging, July 2023
- **Role:** Co-author
- **Tags:** `federated-learning` `generative-models` `medical-imaging` `mri` `privacy`
- **Tech:** TensorFlow, GANs
- **Description:** Federated generative priors for accelerated MRI reconstruction. Learns site-level image priors without centralizing patient data; supports privacy-preserving multi-site learning.
- **Best for JDs mentioning:** federated learning, medical imaging, generative models, inverse problems, image reconstruction, privacy, healthcare AI

---

## [FedML] Unified Federated Learning and Distributed Training Library

- **GitHub:** https://github.com/FedML-AI/FedML
- **Role:** Contributor (Research Scientist Intern, May–Aug 2022)
- **Stars:** 4,045
- **Tags:** `federated-learning` `graph-neural-networks` `systems` `privacy` `distributed-learning`
- **Tech:** Python, PyTorch
- **Description:** Unified and scalable ML library for large-scale distributed training, model serving, and federated learning. Supports cross-silo and cross-device scenarios. Developed secure federated GNN training and link-level differential privacy algorithms during internship at TensorOpera AI (formerly FEDML AI).
- **Best for JDs mentioning:** federated learning, distributed ML, ML systems, privacy-preserving learning, open-source infrastructure, production ML
