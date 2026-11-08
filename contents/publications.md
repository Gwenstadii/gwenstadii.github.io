#### 已投稿

<div class="contribution-card">
<h3>个人贡献（重点）</h3>

<p class="contribution-pain-title">痛点：全 32 层注入 + 按深度切 shared / specific，直接撞上五个连锁问题</p>
<ul class="contribution-pain">
<li><strong>参数仓体积失控</strong>：rank=16、24 层 × 7 模块 → 约 13.9M，是参考实现的约 9 倍；</li>
<li><strong>恢复力太强</strong>：无回放基线的保留率被参数仓恢复抬到 0.2~0.58，降不下来；</li>
<li><strong>漂移面太大</strong>：specific-A 散布在 28 层上，一漂就是断崖（V26：A=B=C=0）；</li>
<li><strong>三种遗忘机制互相制约</strong>：增大 A 漂移 → B/C 也崩；减小 → 只有 A 忘，没有中间态；</li>
<li><strong>遗忘不可预测</strong>：要么忘不干净（参数仓太强），要么全崩（漂移过临界点）。</li>
</ul>
<p>这五条合起来说明：<strong>照搬不是“效果差一点”，而是这个结构在单流主干上根本不成立。</strong></p>

<p>这个项目交给我的起点是一句假设——<strong>“顺序微调会遗忘，加上旧数据回放就能缓解”</strong>。我做的工作不是去验证它，而是把它<strong>拆开、证伪、再重建</strong>。</p>

<p><strong>OpenVLA 没有这个前提。</strong>它只有一条 LLaMA-2 7B 流，动作生成由末端的隐状态经过一个浅层 MLP 动作头（L1 回归）完成。照搬“每个专家 18 层、前后各半”的配方，在这里<strong>无处可落</strong>。</p>

<div class="contribution-block">
<p class="contribution-block-title">我的创新性设计：注入范围（用于对齐模型架构）</p>
<div class="result-table-wrap" role="region" tabindex="0" aria-label="OpenVLA 上的注入设计，窄屏可横向滚动">
<table class="result-table contribution-table">
<thead><tr><th scope="col">模块范围</th><th scope="col">决策</th><th scope="col">做法</th><th scope="col">依据</th></tr></thead>
<tbody>
<tr>
<th scope="row">浅层 L0–23</th>
<td class="decision">不注入</td>
<td>完全裸冻结</td>
<td>预训练表征已足够；挂 LoRA 只增加被改写面积、撑大参数仓、对精度几乎零增益</td>
</tr>
<tr>
<th scope="row">深层 L24–31</th>
<td class="decision">当“动作专家”</td>
<td>拆 shared(4) / specific(4)</td>
<td>单流主干没有第二条流可切，就在单流内部人为造出“专家的内部结构”</td>
</tr>
<tr>
<th scope="row">动作头 4 个 Linear</th>
<td class="decision">当“出口”</td>
<td>全部注入、全按 specific</td>
<td>它是真正的任务输出端，没有跨任务共享价值</td>
</tr>
</tbody>
</table>
</div>
<p class="contribution-note">三个可观测指标同时验证了这个选择：参数仓规模从 13.9M 回到参考实现的量级（约 3.5M）、恢复力从“太强以致基线降不下来”变成“刚好”、<strong>单任务成功率反而是 0.96</strong>（说明浅层确实不需要微调），漂移被物理限制在 4 层内。</p>
</div>

<p class="contribution-subtitle">其余原创性工作</p>
<ul class="contribution-list">
<li><strong>判据：提出并验证「回放可达性 × 容错度」。</strong>回放只能修复“梯度能作用到评估路径、且该通道对旧任务容错足够”的损伤。该判据在 <strong>4 组独立实验中验证</strong>，其中 <strong>1 组被本人数据证伪</strong>后修正为二维，修正后的预测被后续主结果全部命中。</li>
<li><strong>定位：用模块级漂移探针推翻被 4 次复现的结论。</strong>把“特定层 LoRA-A 漂移导致遗忘”拆成 <strong>12 个模块</strong>逐个做探针，真正的单点故障只有<strong>动作头入口投影 fc1 的 LoRA-A</strong>（旧任务 0.00，其余模块约 0.9），保护成本从“冻结全部 8 层 A”降到<strong>“冻结 1 个模块”</strong>。</li>
<li><strong>诊断与实验构造：</strong>查明评估时真正使用的参数路径（B_K, A_final）<strong>从未被训练过</strong>，并识别出“部分恢复参数仓”是<strong>任务身份冲突</strong>而非记忆衰减的评估语义陷阱；由此定出主实验配方（只让“回放够得到但未被保护”的通道充当遗忘源）与同预算单变量消融，证明<strong>选帧策略本身是方法的组成部分</strong>。</li>
</ul>

<p class="contribution-note">边界：CL-LoRA 的方法思想与原型回放流程来自 π0.5 参考实现；本人在本项目中负责<strong>机制归因、判据提炼、实验体系设计</strong>，以及论文方法章节与全部机制图件的绘制。</p>
</div>

**PropelVLA: Prototype-Anchored Parameter-Efficient Lifelong Adaptation for Vision-Language-Action Models**&ensp;<strong>CVPR 2027 已投稿</strong>

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

> **作图声明：上方共享-专用适配与 ACPR 两张方法图，作图全部由本人独立完成**（全部矢量图元独立绘制，并按最终印刷尺寸逐块验收可读性与换行溢出）。

<div class="openreview-card">
<h3>投稿信息</h3>
<figure>
<img src="static/assets/img/propel-vla/openreview.png" alt="OpenReview 投稿页截图：标题 PropelVLA、作者、提交日期 2026-11-06、CVPR 2027 Conference Submission 徽标、Subject Area、Keywords 与摘要" loading="lazy" />
</figure>
<p class="openreview-table-title">OpenReview 页面上的公开元数据</p>
<div class="result-table-wrap" role="region" tabindex="0" aria-label="投稿元数据，窄屏可横向滚动">
<table class="result-table openreview-table">
<tbody>
<tr><th scope="row">标题</th><td>PropelVLA: Prototype-Anchored Parameter-Efficient Lifelong Adaptation for Vision-Language-Action Models</td></tr>
<tr><th scope="row">作者</th><td>Zhanxiang Li, Taozhi Yang, <strong>彭圣迪（Shengdi Peng）</strong>, Huaidong Zhang（华南理工大学）</td></tr>
<tr><th scope="row">投稿</th><td>CVPR 2027 Conference Submission · 提交于 2026 年 11 月 6 日</td></tr>
<tr><th scope="row">研究与关键词</th><td>Physical AI: World Models, VLA, Planning, Simulation；vision-language-action models, continual learning, lifelong robot learning, parameter-efficient fine-tuning, low-rank adaptation, experience replay, robotic manipulation</td></tr>
<tr><th scope="row">摘要要点</th><td>参数高效的 VLA 终身适配框架：任务路由的共享-专用适配（TRSSA）＋ 动作条件原型回放（ACPR）；在四种 VLA 主干与 LIBERO / RoboTwin2.0 上优于均匀回放 4.0–33.5 个百分点，八阶段真机实验最终成功率 66.3%（均匀回放 55.6%）。</td></tr>
</tbody>
</table>
</div>
</div>

#### 进行中

**视觉—语言—动作模型（VLA）在持续学习中的语言条件目标控制退化**&ensp;<strong>论文准备中</strong>

持续学习中的 VLA 模型不只可能遗忘操作技能，还可能丢掉「按指令选目标」的能力——机器人学完新任务之后，面对旧指令是否仍会走向正确的物体，而不只是把动作模式保留下来。

- **初步观察**：旧指令可能被新学目标接管；在相同、且仍可完成旧目标的早期物理状态下，更新后的模型仍表现出目标选择退化；而语言对动作的影响并未完全消失。
- **研究特色**：结合前后配对评测、同状态策略交接与动作响应干预，把**目标选择退化**、**执行退化**、**状态分布变化**区分开，并分析**共同动作倾向**与**指令条件调整**如何共同影响目标控制。
- **下一步**：据此探索有限记忆回放与针对性保护方法；具体内部机制及缓解收益仍在验证中。

<details class="publication-details research-details">
<summary>方法与实验详情</summary>
<div class="publication-detail-body">
<p class="research-scope">本研究基于已有论文开展现象复现与分析方法迁移，进一步考察持续学习如何改变旧指令对目标选择的控制。下述实验为当前阶段的观察；内部机制及缓解收益仍在验证中。</p>
<h3>一、行为现象复现：从熟悉目标偏置到旧指令失控</h3>
<section class="research-study">
<h4>1. 熟悉目标覆盖当前指令</h4>
<p class="research-reference">相关工作：<a href="https://arxiv.org/abs/2602.17659" target="_blank" rel="noopener">When Vision Overrides Language</a> · LIBERO-CF</p>
<p><strong>论文现象：</strong>在同一场景中，即使指令要求另一个合理目标，模型仍可能执行训练时熟悉的任务。</p>
<p><strong>复现观察：</strong>仅学习左格任务的模型，面对未训练的前／右／后指令，30 回合的首次目标全部为左格。继续学习右格后，旧左指令开始触发右格行为；在充分续训后的对应实验中，<strong>14/20 回合最终完成右格</strong>。</p>
<p><strong>进一步研究：</strong>复现“熟悉目标偏置”和“指令被默认行为覆盖”，并进一步观察默认目标如何随后续学习改变，甚至覆盖原来已经能执行的旧指令。</p>
</section>
<section class="research-study">
<h4>2. 对语言敏感，不等于正确绑定目标</h4>
<p class="research-reference">相关工作：<a href="https://arxiv.org/abs/2609.39971" target="_blank" rel="noopener">When Instructions Retrieve Trajectories</a> · ECT</p>
<p><strong>论文现象：</strong>模型可能对语言变化作出反应，却仍调用熟悉行为，因而不能把失败全部归因于“完全忽略语言”。论文以 ECT 反事实数据与配对训练缓解此类问题。</p>
<p><strong>复现观察：</strong>在书场景中，训练模板与同模板替换位置词的指令均为 <strong>10/10 指向新右格</strong>；同义改写为 <strong>7/10</strong>；无关句与乱码均为 <strong>0/10</strong>。语言影响是否启动搬运，却没有可靠决定搬往哪个格子。</p>
<p><strong>进一步研究：</strong>复现“语言响应仍存在，但指令—动作目标绑定不可靠”的行为现象，并将其放到持续学习前后进行比较。这里报告的是行为现象复现，不代表已完成 ECT 缓解方法的复现。</p>
</section>
<section class="research-study">
<h4>3. 语言响应仍在，但未可靠控制目标</h4>
<p class="research-reference">相关工作：<a href="https://arxiv.org/abs/2610.06235" target="_blank" rel="noopener">Encoded but Not in Control</a></p>
<p><strong>论文发现：</strong>指令变化仍可影响内部预测，目标信息甚至可以被线性解码，但这些信息未必决定机器人选择哪个目标。</p>
<p><strong>对应观察：</strong>固定观测、机器人状态、动作草稿与生成时刻后，续训模型对不同旧指令仍产生不同响应；但在同一早期物理状态下，旧模型能按左／前指令分流，续训模型却都去右格。K4 实验还发现，位置词获得注意力，不代表屏蔽它就会改变续训模型的目标。</p>
<p><strong>研究重点：</strong>把“有语言响应”“有目标相关信息”与“语言实际控制目标”区分开，通过同状态策略交接与闭环行为评估检查控制是否保留。当前观察不等同于已证实与相关论文完全相同的内部机制。</p>
</section>
<h3>二、因果干预分析：动作条件接口与响应分解</h3>
<section class="research-study">
<h4>4. 通过激活替换分析动作条件接口</h4>
<p class="research-reference">方法参考：<a href="https://arxiv.org/abs/2610.20750" target="_blank" rel="noopener">Causal Analysis of Robot Foundation Models Enables Efficiency Gains</a></p>
<p><strong>论文方法：</strong>通过内部激活替换，分析图像和指令经哪些接口影响动作；在其研究的部分模型中，因果作用集中于少数跨注意力层。</p>
<p><strong>已实现的分析：</strong>跨检查点消息交换、逐层跨注意力（CA）干预、注意力组合替换、层内拆分，以及闭环目标评估。</p>
<p><strong>进一步研究：</strong>将这些干预用于持续学习前后的检查点比较，考察哪些动作条件接口参与旧指令目标控制的变化。已实现分析工具，不预先断言本研究模型也具有相同的层级集中性。</p>
</section>
<section class="research-study">
<h4>5. 区分共同动作倾向与指令条件差异</h4>
<p class="research-reference">方法参考：<a href="https://arxiv.org/abs/2610.08718" target="_blank" rel="noopener">When Forgetting is not Catastrophic</a></p>
<p><strong>论文机制：</strong>新训练引起的共同表征位移，可能使旧知识暂时难以访问；消除共同位移等干预可以恢复部分旧事实。该工作讨论语言模型中的知识遗忘，为本研究提供分析思路。</p>
<p><strong>已有对应分析：</strong>把旧指令下的动作响应拆成共同部分 <strong>μ</strong> 与条件差异 <strong>d</strong>，交叉恢复两部分，分别观察目标偏置、运动分流和完整任务成功如何变化。</p>
<p><strong>进一步研究：</strong>将共同变化与条件信息变化的区分迁移到 VLA 动作控制分析，检验共同动作倾向与指令条件调整各自的作用。目标偏置或运动分流发生变化，不直接等同于完整任务成功恢复。</p>
</section>
<p class="results-note"><strong>实验口径：</strong>30 回合记录的是首次目标；14/20 记录的是充分续训后对应实验的最终右格完成情况；书场景中的 10/10、7/10、0/10 记录的是不同语言条件下指向新右格的表现。这些数字来自不同实验条件，不合并计算总体成功率。</p>
</div>
</details>
