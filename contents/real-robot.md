#### 平台与任务

真机平台为 **Kinova 六自由度协作机械臂 + Robotiq 2F 自适应夹爪**：桌面场景中以苹果为操作对象、纸盒为放置目标，任务是「把桌上的苹果抓起来放进纸盒」。这组尝试的目的，是把 VLA 策略从仿真设定搬到真实机械臂上，观察它在开放环境里的实际表现。

#### 实验内容

- 把 **OpenVLA** 基座策略接到真机上：相机图像与语言指令作为观测输入，策略输出 7 维末端增量动作（Δx, Δy, Δz, Δroll, Δpitch, Δyaw 与夹爪开合），由 Kinova 闭环执行。
- 在真实光照、遮挡与桌面杂物的背景下跑多轮抓放，完整记录接近 → 抓取 → 搬运 → 放置四个阶段中策略的表现。
- 这组实验用于暴露仿真与真机之间的差距（抓取点偏差、深度与尺度误差、末端位姿抖动、放置阶段与盒壁的碰撞），为 VLA 模型的轻量化与持续学习研究提供真机侧的验证依据与数据反馈。

#### 过程记录

<div class="robot-gallery">
  <figure>
    <a class="figure-link" href="static/assets/img/openvla-kinova/01-approach.jpg" target="_blank" rel="noopener" aria-label="查看原图：机械臂接近纸盒中的苹果">
      <img src="static/assets/img/openvla-kinova/01-approach.jpg" alt="Kinova 机械臂伸出，Robotiq 夹爪张开移动到纸盒上方对准盒中的苹果" loading="lazy" />
    </a>
    <figcaption><strong>接近</strong>：夹爪对准盒中苹果</figcaption>
  </figure>
  <figure>
    <a class="figure-link" href="static/assets/img/openvla-kinova/02-grasp.jpg" target="_blank" rel="noopener" aria-label="查看原图：夹爪夹住苹果并抬离纸盒">
      <img src="static/assets/img/openvla-kinova/02-grasp.jpg" alt="夹爪闭合夹住苹果，把苹果抬离纸盒底面" loading="lazy" />
    </a>
    <figcaption><strong>抓取</strong>：夹住并抬离盒底</figcaption>
  </figure>
  <figure>
    <a class="figure-link" href="static/assets/img/openvla-kinova/03-transport.jpg" target="_blank" rel="noopener" aria-label="查看原图：保持夹持搬运苹果">
      <img src="static/assets/img/openvla-kinova/03-transport.jpg" alt="保持夹持状态在桌面上方移动苹果，右侧可见同一场景中的第二台 Kinova 机械臂" loading="lazy" />
    </a>
    <figcaption><strong>搬运</strong>：保持夹持移动</figcaption>
  </figure>
  <figure>
    <a class="figure-link" href="static/assets/img/openvla-kinova/04-release.jpg" target="_blank" rel="noopener" aria-label="查看原图：张爪放下苹果">
      <img src="static/assets/img/openvla-kinova/04-release.jpg" alt="夹爪张开，把苹果释放到桌面纸盒旁边" loading="lazy" />
    </a>
    <figcaption><strong>放置</strong>：张爪释放苹果</figcaption>
  </figure>
</div>
