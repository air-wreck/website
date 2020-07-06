---
title: Information Density in Languages
date: 2020-07-05
---

I remember seeing an interesting article a little while back positing
that different languages have roughly the same information density; that
is, even though speakers of one language may speak faster than those of
another, human languages naturally tend to convey ~39 bits of
information per second. I don't remember where I originally saw that
article (more likely than not it was one of Hacker News, Reddit, or the
New York Times), but apparently
[this](https://advances.sciencemag.org/content/5/9/eaaw2594) is the
source paper, and
[here](https://www.theatlantic.com/science/archive/2019/09/people-speak-faster-less-efficient-languages/597391/)
is a writeup in _The Atlantic_ that I was able to find.

Today, [PCC](https://www.pittsburghchinesechurch.org/) had a joint
service between the Chinese- and English-speaking congregations. This
usually means that the sermon is delivered in one of the two languages
and translated line-by-line by an interpreter. I'm not sure if the
translation is written in advance or done on the spot; I figure that it
depends on the person, because I've definitely seen translators pause
for a moment to think of a translation (sometimes even with audience
suggestions).

I don't know why it came to mind this morning, but I thought that it'd
be funny to do an empirical test of the information density constancy
hypothesis. This scenario seemed ideal for such a test, since the pastor
and the translator are (theoretically) delivering the exact same
content, line-by-line, in two different languages. The nice thing about
attending church over Zoom is that you can take such measurements
without being very disruptive.

Even though Zoom said that the sermon was being recorded, I'm a little
impatient, so I decided not to wait for the recording to come out and
just timed a few arbitrarily chosen samples on my phone a few times. I
didn't do it too extensively because I was, you know, also trying to
_actually_ pay attention to the sermon. Here are the raw data:

```python
# E[i], C[i] are the durations (in seconds) of fragment i spoken
# in English (pastor) and Chinese (interpreter) respectively
E = [4.01, 4.40, 5.15, 7.72, 8.73, 2.26, 4.54, 8.61, 7.94, 5.38,
     7.71, 10.33, 9.47, 3.51, 5.06, 9.48, 13.27, 11.60, 8.64]
C = [2.88, 4.19, 4.11, 7.59, 10.78, 2.02, 3.74, 6.46, 7.15, 7.45,
     8.22, 8.13, 6.46, 3.29, 4.93, 12.90, 15.94, 8.93, 8.95]
```

I also timed two longer samples: a reading through Ruth 1:15-22, which
took 1:25.93 minutes in the English and 1:24.63 in the Chinese, as well
as a fragment that took 23.68 seconds in English and 15.54 seconds in
Chinese. I did not include them because I'm not a statistician and am a
bit spooked by potential outliers.

I don't remember much of AP Statistics (not that that class was exactly
the paragon of scientific rigor...) and haven't had the pleasure of
taking [PnC](http://www.cs.cmu.edu/~harchol/PnC/class.html) at CMU yet,
but I suppose some kind of paired T-test would be relevant here. I will
skip checking the preconditions and just assume that they hold:

```python
from scipy.stats import ttest_rel
ttest_rel(E, C)  # p = 0.6383
```

Seeing that the p-value is so high, we surely fail to reject the null
hypothesis, which is to say that based on these data it would appear
that English and Chinese indeed convey information at the same rate.

Of course, this depends a lot on the speaker and interpreter setup. I've
found that some pastors like to speak slowly, drawing out emphasis in
their sermons. On the other hand, if the interpreter is not prepared, he
or she may have to think on the fly, which can impair the speed of
translation.
