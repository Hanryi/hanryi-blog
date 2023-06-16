---
outline: deep
---

<style src="./formula.styl"></style>

# 蓄水池抽样算法

## 前言

**抽样 (Sampling)** 是一个在生活中时常发生的概率事件。例如，一个总人数为 $N$ 的团队需要安排团队内的 $m\;(1\leqslant m\leqslant N)$ 位成员出差，可以让团队每个成员从 $N$ 份纸团中任意抽取一个纸团，这 $N$ 份纸团中有 $m$ 份纸团写有 $1$ 剩下写的都是 $0$ ，根据抽签的结果，由抽到 $1$ 的 $m$ 位成员出差。根据基础的统计学知识，我们很容易得知每个人抽到写有 $1$ 的纸团的概率均为 $\frac{m}{N}$ ，而且与抽取的先后顺序无关，每个人抽到出差的概率都是相等的。

等概率抽样是实现抽样随机性的重要前提，对于确定的样本空间，保证每个样本被等概率采样往往是比较容易实现的。但我们有时也会遇到样本空间的大小 $N$ 未知，只有采样数 $m$ 是已知的情况，且仍要保证每个样本被抽样的概率都相等。要在短时间内给出这一问题的解法并不容易，而蓄水池算法 ($Reservoir\ Sampling\ Algo$) 则为这一问题提供了一个精妙的解决方案。

不得不承认这一算法的确很难想到，但理解之后，就会发觉它是如此的 $Elegant$ 。

## 问题描述

有一个总行数 $N$ 未知且很大的文本数据流，要求仅遍历该数据流一次，从中抽取 $m\;(1\leqslant m\leqslant N)$ 行，并使得数据流中每行被抽到的概率都相等。

## 算法实现

> 由于该算法并不容易从已知的条件中推导得出，因此，不妨先了解该算法的计算过程，再去理解这看似灵光乍现的合理性。

要论证蓄水池算法在统计学上的合理性或许要花点功夫，但具体执行起来却并不困难。对于上述问题，我们可以按如下方式进行采样：

1. 创建一个可容纳 $m$ 个元素的蓄水池数组；
   创建一个初始值为 $1$ 的变量 $i$ ，该变量每遍历一行数据就自增 $1$ ，用于记录当前遍历的行数；
2. 当 $1\leqslant i\leqslant m$ 时，持续向数组中添加当前遍历的数据流元素，直至填满蓄水池数组；
3. 当 $m < i$ 时，先在区间 $[1,\;i]$ 内生成一个随机整数，若生成的随机整数落在区间 $[1,\;m]$ 中，则用当前的第 $i$ 个数据流元素，替换掉蓄水池数组中随机整数落在位置上的元素；
4. 完成整个数据流的一次遍历后，蓄水池数组中包含的 $m$ 个元素就是对所有 $N$ 个样本等概率采样的结果；

### Code

在遍历过程之前添加了一个初始化的随机数生成器，保证每次使用相同的全局随机数参数时，可以生成同样的随机数序列供 `randint()` 方法调用，使得结果可复现。

::: code-group

~~~python
def reservoir_sampling(stream, pool_size=10, seed=None):
    """ Reservoir sampling algo.

    :param stream: iterable
        A data stream which length needs to be greater than pool_size
    :param pool_size: int
        Number of samples to be taken, default 10
    :param seed: Union[None, int] (Optional)
        Selectively set a random seed sequence, default None
    :return: list
        Sampling result containing pool_size samples
    """
    random.seed(seed) // [!code ++]
    pool = [next(stream) for _ in range(pool_size)]

    step = 1
    for data in stream:
        idx = random.randint(1, pool_size + step)
        if 1 <= idx <= pool_size:
            pool[idx - 1] = data
        step += 1

    return pool
~~~

~~~go
// Translated by chatgpt. // [!code focus]

package main

import (
	"fmt"
	"math/rand"
	"time"
)

func reservoirSampling(stream <-chan int, poolSize int, seed int64) []int {
	rand.Seed(seed)

	pool := make([]int, poolSize)
	for i := 0; i < poolSize; i++ {
		pool[i] = <-stream
	}

	step := 1
	for data := range stream {
		idx := rand.Intn(poolSize + step)
		if idx < poolSize {
			pool[idx] = data
		}
		step++
	}

	return pool
}

func main() {
	// Create a stream of numbers
	stream := make(chan int)
	go func() {
		for i := 0; i < 100; i++ {
			stream <- i
		}
		close(stream)
	}()

	poolSize := 10
	seed := time.Now().UnixNano()

	pool := reservoirSampling(stream, poolSize, seed)
	fmt.Println(pool)
}
~~~

~~~rust
// Translated by chatgpt. // [!code focus]

use rand::Rng;
use std::vec::Vec;

fn reservoir_sampling<T, I>(stream: I, pool_size: usize, seed: u64) -> Vec<T>
where
    I: Iterator<Item = T>,
{
    let mut rng = rand::rngs::StdRng::seed_from_u64(seed);

    let mut pool: Vec<T> = stream.take(pool_size).collect();

    let mut step = 1;
    for data in stream {
        let idx = rng.gen_range(0, pool_size + step);
        if idx < pool_size {
            pool[idx] = data;
        }
        step += 1;
    }

    pool
}

fn main() {
    let stream = 0..100;

    let pool_size = 10;
    let seed = rand::thread_rng().gen();

    let pool = reservoir_sampling(stream, pool_size, seed);
    println!("{:?}", pool);
}
~~~

:::

## 原理解析

上述程序并不复杂，但为何这一简单的过程能够在未知大小的样本空间中完成有限样本的等概率采样？

### 案例：平台抽奖机制

在分析更复杂的数学问题之前，我们先来讨论这样一个场景：

某平台于某日 18:00-20:00 开启了一项在线抽奖活动，奖品只有 $1$ 份，凡是在活动期间参与抽奖的用户均有概率抽中这份奖品，中奖名单将在当天 20:00 公布。

很显然，这一场景下报名参与抽奖的人数不可预知，且平台要求互动的即时性，活动一结束就立即返回中奖名单，时间只能允许遍历一次抽奖数据，同时这一过程中还要保证每个用户中奖概率相等，这显然是一个典型的蓄水池算法的应用案例。

**抽奖过程分析**

我们根据上述算法的步骤，分析下具体的抽奖过程：

- 当总抽奖人数只有 $1$ 个人时， $i=1$ ：
  这个人中奖的概率为 $1/1=1$ ；
- 当又来了一位新的用户参与抽奖， $i=2$ ：
  抽奖系统于用户队列 $[1,\;2]$ 内生成一个随机整数，依据等概率抽样的原则，第 $2$ 个人中奖的概率为 $1/len([1,\;2])=1/2=\frac{1}{2}$ ；
  此时总人数为 $2$ ，随机整数落到用户队列最前面 $1$ 个用户的概率为 $\frac{1}{2}$ ；
  - 第 $1$ 个人中奖的概率为 $1\times\frac{1}{2}=\frac{1}{2}$ ；
- 当又来了一位新的用户参与抽奖， $i=3$ ：
  抽奖系统于用户队列 $[1,\;2,\;3]$ 内生成一个随机整数，依据等概率抽样的原则，第 $3$ 个人中奖的概率为 $1/len([1,\;2,\;3])=1/3=\frac{1}{3}$ ；
  此时总人数为 $3$ ，随机整数落到用户队列最前面 $2$ 个用户中奖的概率为 $\frac{2}{3}$ ；
  - 第 $2$ 个人中奖的概率为 $\frac{1}{2}\times\frac{2}{3}=\frac{1}{3}$ ；
  - 第 $1$ 个人中奖的概率为 $\frac{1}{2}\times\frac{2}{3}=\frac{1}{3}$ ；
- 当又来了一位新的用户参与抽奖， $i=4$ ：
  抽奖系统于用户队列 $[1,\;2,\;3,\;4]$ 内生成一个随机整数，依据等概率抽样的原则，第 $4$ 个人中奖的概率为 $1/len([1,\;2,\;3,\;4])=1/4=\frac{1}{4}$ ；
  此时总人数为 $4$ ，随机整数落到用户队列最前面 $3$ 个用户中奖的概率为 $\frac{3}{4}$ ；
  - 第 $3$ 个人中奖的概率为 $\frac{1}{3}\times\frac{3}{4}=\frac{1}{4}$ ；
  - 第 $2$ 个人中奖的概率为 $\frac{1}{3}\times\frac{3}{4}=\frac{1}{4}$ ；
  - 第 $1$ 个人中奖的概率为 $\frac{1}{3}\times\frac{3}{4}=\frac{1}{4}$ ；
- ...
- 当总抽奖人数共有 $N$ 个人时， $i=N$ ：
  抽奖系统于用户队列 $[1,\;2,\;\cdots,\;N]$ 内生成一个随机整数，依据等概率抽样的原则，第 $4$ 个人中奖的概率为 $1/len([1,\;2,\;\cdots,\;N])=1/4=\frac{1}{4}$ ；
  此时总人数为 $N$ ，随机整数落到用户队列最前面 $N-1$ 个用户中奖的概率为 $\frac{N-1}{N}$ ；
  - 第 $1,\;2,\;\cdots,\;N-1$ 个人的中奖概率均由 $\frac{1}{N-1}$ 变更为 $\frac{1}{N-1}\times\frac{N-1}{N}=\frac{1}{N}$ ；

**抽奖机制归纳**

可以清楚地看到，任意数量的用户参与抽奖，均能保证每个用户中奖的概率相等。虽然每个用户在参与进来时中奖的初始概率是不同的，有的用户初始中奖概率是 $1$ 有的用户初始中奖概率是 $\frac{1}{3}$ ，但均能通过不同长度的概率连乘式修正到所有用户等概率中奖的情况上（例如，当总抽奖人数为 $3$ 时，第 $1$ 位参与抽奖的用户中奖概率的连乘表达式为 $1\times\frac{1}{2}\times\frac{2}{3}=\frac{1}{3}$ ，计算结果与第 $3$ 位参与抽奖的用户的初始中奖概率相同）。

这一案例是在未知样本空间中等概率只抽取 $1$ 个样本的情况，实际可以推广到等概率抽取更多样本的情况上。

### 数学证明

上述直观的过程解释已经对算法的执行过程和原理做了较为明确的解释，下面展开进一步的数学证明，以证明该算法适用于更一般的情况。

当在第 $i$ 步遍历到数据流中的第 $i$ 个数据元素时，其被采样进入蓄水池数组中的概率为 $\frac{m}{i}$ 。

继续遍历，当在 $i+1$ 步时，第 $i+1$ 个元素被采样进入蓄水池数组的概率为 $\frac{m}{i+1}$ ，同时我们已知蓄水池数组中存在 $m$ 个元素，每个元素被选中为被替换元素的概率均为 $\frac{1}{m}$，因此第 $i+1$ 个元素替换掉第 $i$ 步采样进入蓄水池数组的概率为 $\frac{m}{i+1}\times\frac{1}{m}=\frac{1}{i+1}$ ，相对的，第 $i$ 个数据元素被保留在蓄水池数组的概率便为 $1-\frac{m}{i+1}\times\frac{1}{m}=1-\frac{1}{i+1}=\frac{i}{i+1}$ 。同理，在第 $i+2$ 步中，第 $i$ 个元素保留在蓄水池数组中的概率为 $1-\frac{m}{i+2}\times\frac{1}{m}=\frac{i}{i+2}$ 。后续以此类推。

因此，对于第 $i$ 步添加进入蓄水池数组的数据元素，其能保留到最后的概率 $P_i$ 可表达为如下概率连乘式：
$$
P_i
=\frac{m}{i}\times(1-\frac{m}{i+1}\times\frac{1}{m})\times(1-\frac{m}{i+2}\times\frac{1}{m})\times\cdots\times(1-\frac{m}{N}\times\frac{1}{m})
$$

$$
=\frac{m}{i}\times\frac{i}{i+1}\times\frac{i+1}{i+2}\times\cdots\times\frac{N-1}{N}
$$

$$
=\frac{m}{N}
$$

这便实现了对于未知总体大小的样本空间，进行确定数量的样本等概率抽样。

**注**：在推导过程中我并未单独考虑 $i<m$ 的情况，即在填满蓄水池数组之前添加的 $m-1$ 个元素保留到最后的情况，按照公式计算会出现 $\frac{m}{i}>1$ 的项，而统计学在原则上是不会出现概率 $P_i>1$ 的。之所以未单独考虑，一是不想破坏公式推导的连续性，影响阅读体验，因为这两部分情况的推导过程是近乎完全相同的，只是初始概率有区别，准确的来讲，前 $m-1$ 个和后续的数据流元素均可表示为 $min(1,\;\frac{m}{i})$ ，只是前 $m-1$ 个数据元素对该式的运算结果为 $1$ ，后续元素的运算结果为 $\frac{m}{i}$；二是虽然统计学原则上不允许概率大于 $1$ ，但在本公式的运算结果中不会出现概率大于 $1$ 的悖论，稍加分析就可以得知如下等式恒成立。
$$
\prod_{1}^{m}1=m\times\prod_{2}^{m}\frac{i-1}{i}
$$

## 分布式蓄水池算法

利用分布式计算的优势突破单颗 CPU 算力的限制，为蓄水池算法提速。

Coming Soon! 