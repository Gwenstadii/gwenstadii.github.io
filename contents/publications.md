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

<div class="experiment-results">
<h3>四阶段持续学习实验结果</h3>
<div class="results-grid">
<div class="result-table-wrap" role="region" tabindex="0" aria-label="LIBERO 实验结果，窄屏可横向滚动">
<table class="result-table">
<caption>表 1 · LIBERO（四阶段）</caption>
<thead><tr><th scope="col">Backbone</th><th scope="col">Method</th><th scope="col">FWT ↑</th><th scope="col">NBT ↓</th><th scope="col">AUC ↑</th><th scope="col">Final SR ↑</th></tr></thead>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">π<sub>0</sub></th>
<th scope="row">LoRA</th>
<td>93.00</td>
<td>93.33</td>
<td>48.29</td>
<td>23.00</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td><u>95.50</u></td>
<td>63.22</td>
<td>65.38</td>
<td>43.00</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td><strong>96.00</strong></td>
<td><u>15.22</u></td>
<td><u>88.67</u></td>
<td><u>85.00</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><u>95.50</u></td>
<td><strong>4.78</strong></td>
<td><strong>93.42</strong></td>
<td><strong>91.50</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">π<sub>0.5</sub></th>
<th scope="row">LoRA</th>
<td><u>91.50</u></td>
<td>83.78</td>
<td>52.17</td>
<td>24.00</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td>87.00</td>
<td>43.56</td>
<td>66.00</td>
<td>45.50</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td>89.00</td>
<td><u>8.67</u></td>
<td><u>85.08</u></td>
<td><u>79.50</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>94.00</strong></td>
<td><strong>3.44</strong></td>
<td><strong>92.71</strong></td>
<td><strong>91.00</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">SmolVLA</th>
<th scope="row">LoRA</th>
<td><u>91.50</u></td>
<td>85.00</td>
<td>49.92</td>
<td>28.00</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td><u>91.50</u></td>
<td>59.44</td>
<td>62.83</td>
<td>48.00</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td>89.50</td>
<td><u>10.11</u></td>
<td><u>84.25</u></td>
<td><u>82.50</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>92.00</strong></td>
<td><strong>6.00</strong></td>
<td><strong>88.92</strong></td>
<td><strong>88.00</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">OpenVLA</th>
<th scope="row">LoRA</th>
<td>94.00</td>
<td>94.00</td>
<td>48.75</td>
<td>23.50</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td><u>95.00</u></td>
<td>54.67</td>
<td>67.75</td>
<td>47.50</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td>93.50</td>
<td><u>38.89</u></td>
<td><u>73.62</u></td>
<td><u>58.00</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>96.50</strong></td>
<td><strong>4.67</strong></td>
<td><strong>94.29</strong></td>
<td><strong>91.50</strong></td>
</tr>
</tbody>
</table>
</div>
<div class="result-table-wrap" role="region" tabindex="0" aria-label="RoboTwin2.0 实验结果，窄屏可横向滚动">
<table class="result-table">
<caption>表 2 · RoboTwin2.0（四阶段）</caption>
<thead><tr><th scope="col">Backbone</th><th scope="col">Method</th><th scope="col">FWT ↑</th><th scope="col">NBT ↓</th><th scope="col">AUC ↑</th><th scope="col">Final SR ↑</th></tr></thead>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">π<sub>0</sub></th>
<th scope="row">LoRA</th>
<td><u>92.00</u></td>
<td>93.33</td>
<td>47.08</td>
<td>22.00</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td>90.00</td>
<td>67.67</td>
<td>57.88</td>
<td>36.00</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td>90.00</td>
<td><u>6.56</u></td>
<td><u>87.08</u></td>
<td><u>83.50</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>93.50</strong></td>
<td><strong>4.89</strong></td>
<td><strong>91.58</strong></td>
<td><strong>87.50</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">π<sub>0.5</sub></th>
<th scope="row">LoRA</th>
<td>92.50</td>
<td>93.33</td>
<td>47.62</td>
<td>22.50</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td>93.00</td>
<td>72.67</td>
<td>57.29</td>
<td>36.00</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td><u>93.50</u></td>
<td><u>17.00</u></td>
<td><u>85.58</u></td>
<td><u>79.00</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>95.00</strong></td>
<td><strong>11.78</strong></td>
<td><strong>89.50</strong></td>
<td><strong>83.50</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">SmolVLA</th>
<th scope="row">LoRA</th>
<td>75.00</td>
<td>80.00</td>
<td>36.37</td>
<td>15.00</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td>74.00</td>
<td>63.78</td>
<td>42.88</td>
<td>23.00</td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td><strong>76.00</strong></td>
<td><u>31.11</u></td>
<td><u>61.42</u></td>
<td><u>50.00</u></td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><u>75.50</u></td>
<td><strong>17.56</strong></td>
<td><strong>67.08</strong></td>
<td><strong>63.00</strong></td>
</tr>
</tbody>
<tbody>
<tr>
<th scope="rowgroup" rowspan="4">OpenVLA</th>
<th scope="row">LoRA</th>
<td>85.50</td>
<td>86.67</td>
<td>43.46</td>
<td>20.50</td>
</tr>
<tr>
<th scope="row">TRSSA</th>
<td><u>91.00</u></td>
<td>46.33</td>
<td>67.79</td>
<td><u>52.50</u></td>
</tr>
<tr>
<th scope="row">TRSSA + UR</th>
<td>86.00</td>
<td><u>33.78</u></td>
<td><u>68.88</u></td>
<td>51.00</td>
</tr>
<tr class="ours">
<th scope="row">PROPEL-VLA</th>
<td><strong>92.00</strong></td>
<td><strong>14.33</strong></td>
<td><strong>85.46</strong></td>
<td><strong>82.00</strong></td>
</tr>
</tbody>
</table>
</div>
</div>
<p class="results-note"><strong>注：</strong>数据按所提供的论文表格录入，单位为百分点，均为四阶段结果。↑ 表示越高越好，↓ 表示越低越好。FWT：前向迁移；NBT：负向后向迁移；AUC：学习曲线下面积；Final SR：最终成功率。</p>
<p class="results-note">TRSSA 为任务路由的共享-专用适配，UR 为均匀回放；LoRA 与 TRSSA 不使用回放。<strong>粗体</strong>与<u>下划线</u>分别表示同一基座、同一指标的最优与次优结果；并列数值共享排名。浅蓝色行标示 PROPEL-VLA。</p>
</div>

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
