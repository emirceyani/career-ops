# Publications Master List

<!-- ============================================================
     USER LAYER — NEVER auto-updated.
     Add new papers here. The pdf mode reads this file using a
     FIXED selection rule (no JD-based adaptive filtering):
       - Include all papers where E. Ceyani is first/co-first author
       - Include all NeurIPS/ICML/ICLR/AAAI main-track papers
     Tags are kept for reference but are not used for selection.

     TAG TAXONOMY (reference only):
       federated-learning | graph-neural-networks | generative-models
       medical-imaging | mri | ai4science | circuit-design
       llm | agentic-ai | bayesian | uncertainty-quantification
       reinforcement-learning | gflownets | privacy | benchmarking
       systems | personalization | signal-processing | deep-learning
     ============================================================ -->

## Journal Articles

### [MedIA-2024] One model to unite them all — Personalized Federated Multi-Contrast MRI Synthesis

- **Authors:** O. Dalmaz, U. Mirza, G. Elmas, M. Özbey, S. Dar, **E. Ceyani**, S. Avestimehr, T. Çukur
- **Venue:** *Medical Image Analysis*, Volume 94, May 2024, 103121
- **URL:** https://www.sciencedirect.com/science/article/pii/S136184152400046X
- **Tags:** `federated-learning` `generative-models` `medical-imaging` `mri` `personalization`
- **Contribution:** Unified federated GAN model for multi-contrast MRI synthesis across hospital sites; personalized adaptation without centralizing patient data.
- **Best for JDs mentioning:** federated learning, generative models, medical imaging, privacy-preserving ML, healthcare AI, diffusion/GAN models, personalization, multi-site learning

---

### [TMI-2023] Federated Learning of Generative Image Priors for MRI Reconstruction

- **Authors:** G. Elmas, S. Dar, Y. Korkmaz, **E. Ceyani**, B. Susam, M. Ozbey, **S. Avestimehr**, T. Cukur
- **Venue:** *IEEE Transactions on Medical Imaging*, July 2023
- **URL:** https://ieeexplore.ieee.org/abstract/document/9943293
- **Tags:** `federated-learning` `generative-models` `medical-imaging` `mri` `deep-learning`
- **Contribution:** Federated generative priors for accelerated MRI reconstruction; privacy-preserving site-level learning without raw data sharing.
- **Best for JDs mentioning:** federated learning, medical imaging, generative models, inverse problems, image reconstruction, privacy, healthcare AI

---

## Conference & Workshop Papers (Peer-Reviewed)

### [NeurIPS-2025] FALCON — Fully Automated Layout-Constrained Analog Circuit Design

- **Authors:** A. Mehradfar, X. Zhao, Y. Huang, **E. Ceyani**, Y. Yang, S. Han, H. Aghasi, S. Avestimehr
- **Venue:** *NeurIPS 2025* (Main Track)
- **URL:** https://arxiv.org/abs/2505.21923
- **Tags:** `ai4science` `circuit-design` `analog-rf` `llm` `graph-neural-networks` `agentic-ai`
- **Contribution:** End-to-end ML framework combining GNNs and LLMs to automate analog circuit topology selection and layout optimization.
- **Best for JDs mentioning:** AI for science/engineering, circuit design, EDA automation, LLM agents, GNNs, agentic AI, automated design, hardware AI

---

### [SIAM-SDM-2025] FedGrAINS — Personalized Subgraph Federated Learning with Adaptive Neighbor Sampling

- **Authors:** **E. Ceyani**, H. Xie, B. Buyukates, C. Yang, **S. Avestimehr**
- **Venue:** *SIAM International Conference on Data Mining (SDM'25)*, 2025 (oral, acceptance rate 26.7%)
- **URL:** (proceedings link pending)
- **Tags:** `federated-learning` `graph-neural-networks` `personalization` `privacy` `distributed-learning`
- **Contribution:** Adaptive neighbor sampling for subgraph federated GNN training; personalized local models with privacy guarantees across silos.
- **Best for JDs mentioning:** federated learning, graph neural networks, personalization, distributed ML, privacy-preserving learning, subgraph methods

---

### [AAAI-2022] SpreadGNN — Serverless Multi-task Federated Learning for GNNs

- **Authors:** **E. Ceyani\***, C. He\*, K. Balasubramanian\*, M. Annavaram, A.S. Avestimehr (co-first)
- **Venue:** *AAAI 2022* (acceptance rate 15%)
- **URL:** https://ojs.aaai.org/index.php/AAAI/article/view/20643
- **Tags:** `federated-learning` `graph-neural-networks` `multi-task-learning` `systems` `serverless`
- **Contribution:** Serverless federated framework for multi-task GNN training; eliminates central server requirement; supports heterogeneous graph tasks.
- **Best for JDs mentioning:** federated learning, GNNs, multi-task learning, distributed systems, graph ML, decentralized learning

---

### [ICLR-DPML+MLSys-GNNSys-2021] FedGraphNN — Federated Learning System and Benchmark for GNNs

- **Authors:** **E. Ceyani\***, C. He\*, K. Balasubramanian\*, C. Yang, H. Xie, L. Sun, L. He, L. Yang, P.S. Yu, Y. Rong, P. Zhao, J. Huang, M. Annavaram, A.S. Avestimehr (co-first)
- **Venue:** *DPML Workshop at ICLR* and *GNNSys Workshop at MLSys*, 2021
- **URL:** https://arxiv.org/abs/2104.07145
- **Tags:** `federated-learning` `graph-neural-networks` `benchmarking` `systems` `privacy`
- **Contribution:** First federated GNN benchmarking study; open-source system covering 36 datasets, 7 GNN architectures, and 9 federated algorithms across domains.
- **Best for JDs mentioning:** federated learning, GNNs, benchmarking, ML systems, open-source research, graph ML, privacy

---

### [NeurIPS-MedImgMeets-2022] pFLSynth — Personalized Federated MRI Contrast Synthesis (Oral)

- **Authors:** O. Dalmaz, U. Mirza, G. Elmas, M. Özbey, S. Dar, **E. Ceyani**, S. Avestimehr, T. Çukur
- **Venue:** *Medical Imaging Meets NeurIPS Workshop*, Dec 2022 (oral)
- **URL:** (workshop proceedings)
- **Tags:** `federated-learning` `generative-models` `medical-imaging` `mri` `personalization`
- **Contribution:** Workshop paper establishing personalized federated synthesis of MRI contrasts; oral presentation.
- **Best for JDs mentioning:** federated learning, medical imaging, generative models, personalization

---

### [ISMRM-2023] Personalized Federated Multi-Contrast MRI Translation

- **Authors:** O. Dalmaz, U. Mirza, G. Elmas, M. Özbey, S. Dar, **E. Ceyani**, S. Avestimehr, T. Çukur
- **Venue:** *31st Annual Meeting of ISMRM*, Toronto, June 2023
- **URL:** (ISMRM abstract)
- **Tags:** `federated-learning` `medical-imaging` `mri` `personalization`
- **Contribution:** MRI synthesis across federated sites with personalized models; presented at the premier MRI conference.
- **Best for JDs mentioning:** medical imaging, MRI, federated learning, healthcare AI

---

### [ISBI-2023] Personalized, Federated, and Unified MRI Contrast Synthesis

- **Authors:** O. Dalmaz, U. Mirza, G. Elmas, M. Özbey, S. Dar, **E. Ceyani**, S. Avestimehr, T. Çukur
- **Venue:** *IEEE 20th International Symposium on Biomedical Imaging (ISBI)*, Apr 2023
- **URL:** (IEEE ISBI proceedings)
- **Tags:** `federated-learning` `medical-imaging` `mri` `generative-models`
- **Contribution:** Biomedical imaging conference paper on unified federated MRI synthesis.
- **Best for JDs mentioning:** medical imaging, MRI, federated learning, biomedical AI

---

### [SIU-2018] Highly Efficient Recurrent Neural Network Architecture for Data Regression

- **Authors:** T. Ergen, **E. Ceyani**
- **Venue:** *26th Signal Processing and Communications Applications Conference (SIU)*, IEEE, 2018
- **URL:** (IEEE proceedings)
- **Tags:** `deep-learning` `signal-processing` `rnn` `time-series`
- **Contribution:** Early career paper on efficient RNN architectures for regression tasks.
- **Best for JDs mentioning:** signal processing, time series, RNN, efficient neural networks (include only if JD is specifically signal-processing or early-career framing needed)

---

## Working Papers (Under Review / In Preparation)

### [WP-1] Amortizing Intractable Inference in LLM-Guided Bayesian Optimization for Accelerated AI-Driven Scientific Discovery

- **Authors:** **E. Ceyani**, V.S. Gummadi, R. Kapadia, **S. Avestimehr**
- **Venue:** Under preparation
- **URL:** (not yet available)
- **Tags:** `bayesian` `uncertainty-quantification` `llm` `ai4science` `scientific-discovery` `reinforcement-learning`
- **Contribution:** Amortized inference for LLM-guided Bayesian optimization; accelerates active learning and scientific discovery pipelines.
- **Best for JDs mentioning:** Bayesian optimization, LLMs, scientific discovery, uncertainty quantification, active learning, AI for science

---

### [WP-2] Reward-Driven Graph Synthesis for Cross-Silo Federated Learning Using GFlowNets

- **Authors:** **E. Ceyani**, X. Zhu, S. Prakash, S. Lahlou, C. Yang, **S. Avestimehr**
- **Venue:** Under preparation
- **URL:** (not yet available)
- **Tags:** `federated-learning` `graph-neural-networks` `gflownets` `generative-models` `reinforcement-learning`
- **Contribution:** GFlowNets for reward-driven graph topology synthesis in cross-silo federated learning; diversity-seeking exploration of graph structures.
- **Best for JDs mentioning:** federated learning, GFlowNets, generative models, RL, graph synthesis, cross-silo learning

---

## Tag → JD Keyword Mapping

Use this table to map JD keywords to publication tags during selection:

| JD mentions... | Match tags |
|----------------|-----------|
| federated learning, privacy-preserving ML, distributed ML, cross-silo, data privacy | `federated-learning` `privacy` |
| graph neural networks, GNN, graph ML, knowledge graphs, relational learning, graph-based | `graph-neural-networks` |
| generative models, diffusion models, GANs, VAEs, image synthesis, image generation | `generative-models` |
| medical imaging, healthcare AI, clinical AI, radiology, pathology, biomedical imaging | `medical-imaging` |
| MRI, magnetic resonance imaging, MRI reconstruction, MRI synthesis | `mri` `medical-imaging` |
| AI for science, AI4Science, scientific discovery, drug discovery, materials, molecular, physics simulation | `ai4science` `scientific-discovery` |
| circuit design, EDA, analog design, RF design, hardware design automation | `circuit-design` `analog-rf` |
| LLM, large language models, foundation models, language models, GPT, Claude | `llm` |
| agentic AI, autonomous agents, AI agents, tool use, agent systems | `agentic-ai` |
| Bayesian, uncertainty quantification, probabilistic ML, calibration, epistemic uncertainty | `bayesian` `uncertainty-quantification` |
| reinforcement learning, RL, reward modeling, RLHF, policy optimization | `reinforcement-learning` |
| GFlowNets, flow networks, diversity-seeking exploration | `gflownets` |
| benchmarking, evaluation framework, open-source, systems research, ML systems | `benchmarking` `systems` |
| personalization, personalized ML, heterogeneous data, non-IID | `personalization` |
| signal processing, time series, sequential data, wireless, communications | `signal-processing` |
