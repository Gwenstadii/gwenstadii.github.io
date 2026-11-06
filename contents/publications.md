#### 投稿中

**PropelVLA: Prototype-Anchored Parameter-Efficient Lifelong Adaptation for Vision-Language-Action Models**&ensp;<strong>CVPR 2027 投稿中</strong>

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
<p class="openreview-note">本页不放外部链接；<strong>OpenReview 页面上没有可以直接发出来的链接</strong>，请按下面任一方式自行检索到这篇投稿（两种方式都不依赖本页）。</p>
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
<div class="openreview-howto">
<p><strong>如何查到这篇投稿</strong></p>
<ol>
<li><strong>按作者姓名检索</strong>：打开 OpenReview 官网，在搜索框输入作者名（例如 <em>Shengdi Peng</em> 或 <em>Zhanxiang Li</em>），在结果里筛选 <em>CVPR 2027 Conference Submission</em> 这一会议，即可在作者名下找到该条投稿。</li>
<li><strong>按标题检索</strong>：在 OpenReview 搜索框输入标题开头的 <em>PropelVLA</em> 或 <em>Prototype-Anchored Parameter-Efficient Lifelong Adaptation</em>，即可直接定位。</li>
<li><strong>在会议下浏览</strong>：进入 OpenReview 的 CVPR 2027 投稿列表，按 <em>Submitted</em> 排序，请求日期 2026 年 11 月 6 日附近；投稿时若开启了 <em>Student Paper</em> 标记，可据此辅助比对。</li>
</ol>
<p class="openreview-note">说明：CVPR 2027 为双盲评审，审稿期间该条目可能仅对已登录的评审人、领域主席可见；正式录用后，同一 OpenReview 条目会公布正式版本与作者信息。</p>
</div>
</div>

#### 进行中

**视觉—语言—动作模型（VLA）在持续学习中的语言条件目标控制退化**&ensp;<strong>论文准备中</strong>

持续学习中的 VLA 模型不只可能遗忘操作技能，还可能丢掉「按指令选目标」的能力——机器人学完新任务之后，面对旧指令是否仍会走向正确的物体，而不只是把动作模式保留下来。

- **初步观察**：旧指令可能被新学目标接管；在相同、且仍可完成旧目标的早期物理状态下，更新后的模型仍表现出目标选择退化；而语言对动作的影响并未完全消失。
- **研究特色**：结合前后配对评测、同状态策略交接与动作响应干预，把**目标选择退化**、**执行退化**、**状态分布变化**区分开，并分析**共同动作倾向**与**指令条件调整**如何共同影响目标控制。
- **下一步**：据此探索有限记忆回放与针对性保护方法；具体内部机制及缓解收益仍在验证中。
