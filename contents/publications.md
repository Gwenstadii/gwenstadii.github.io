#### 投稿中

**PROPEL-VLA: Prototype-Guided Parameter-Efficient Lifelong Adaptation for Vision-Language-Action Models**&ensp;<strong>CVPR 投稿中</strong>

面向 VLA 模型持续学习中的灾难性遗忘与端侧部署难题，提出原型引导的参数高效终身适配框架 PROPEL-VLA，在冻结预训练主干的前提下同时兼顾新任务可塑性与旧任务保持。

- **任务路由的共享-专用适配（Task-routed shared-specific adaptation）**：解耦可复用的跨任务知识与任务特有的行为适配，通过任务槽位库（Task-specific Slot Bank）为每个任务保留受保护的残差槽位。
- **动作条件原型回放（Action-Conditioned Prototype Replay, ACPR）**：从主导物理运动模式中发现隐式技能阶段，结合多模态上下文、动作 token 特征与细粒度运动/动作变化，挑选代表性关键帧用于回放。
- **实验**：在 LIBERO、RoboTwin2.0、LIBERO-Plus 以及八阶段真实世界持续部署上，跨多种 VLA 主干与基线家族取得更强的终身保持能力、有竞争力的新任务适配与更优的参数效率。

![PROPEL-VLA 总体框架](static/assets/img/propel-vla/framework.png)

*总体框架：持续 VLA 学习设定与 K 阶段顺序任务流（LIBERO / LIBERO-Plus / RoboTwin2.0 / 真实世界），基于 CL-LoRA 的 VLA 模型（共享适配器 + 任务专属适配器），以及隐式技能驱动的原型回放机制。*

![共享-专用 LoRA 分解与任务槽位库](static/assets/img/propel-vla/cl-lora.png)

*共享-专用 LoRA 分解与当前回放梯度路由：稳定坐标、逐步演化的共享路径（B_share）与受保护的任务专属残差槽位（Task-specific Slot Bank）；回放样本约束共享通路、旧槽位冻结，从而在可塑性与保持性之间取得平衡。*

![动作条件原型回放](static/assets/img/propel-vla/acpr.png)

*动作条件原型回放（ACPR）：物理引导的隐式技能分段（平移 / 旋转 / 夹爪主导运动模式）、动作条件描述子与多模态融合，以及鲁棒时序 k-center 关键帧选择与回放缓冲区构建。*

#### 进行中

**视觉—语言—动作模型（VLA）在持续学习中的语言条件目标控制退化**&ensp;<strong>论文准备中</strong>

持续学习中的 VLA 模型不只可能遗忘操作技能，还可能丢掉「按指令选目标」的能力——机器人学完新任务之后，面对旧指令是否仍会走向正确的物体，而不只是把动作模式保留下来。

- **初步观察**：旧指令可能被新学目标接管；在相同、且仍可完成旧目标的早期物理状态下，更新后的模型仍表现出目标选择退化；而语言对动作的影响并未完全消失。
- **研究特色**：结合前后配对评测、同状态策略交接与动作响应干预，把**目标选择退化**、**执行退化**、**状态分布变化**区分开，并分析**共同动作倾向**与**指令条件调整**如何共同影响目标控制。
- **下一步**：据此探索有限记忆回放与针对性保护方法；具体内部机制及缓解收益仍在验证中。
