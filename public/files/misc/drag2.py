import numpy as np
import matplotlib.pyplot as plt

# set pretty fonts
plt.rc('text', usetex=True)
plt.rc('font', family='serif')

# values from lab
g = 9.81     # m/s^2
k = 0.00346  # kg/m
m = 0.00096  # kg

t = np.linspace(0, 1, num=100, endpoint=True)
v = lambda t: np.sqrt(m*g/k) * np.tanh(np.sqrt(k*g/m)*t)
x = lambda t: m/k * np.log(np.cosh(np.sqrt(k*g/m)*t))

# assuming 12 ft = 3.66 m ladder, we start timing from
h_ladder = 3.66
Del_h = 3.66  # change to 2.26 for what we did in the lab
def time_from_dist(x, m=m):
    return np.sqrt(m/k/g) * np.arccosh(np.exp(k*x/m))
def v_exp(mass):
    Del_t = time_from_dist(h_ladder, m=mass) - time_from_dist(h_ladder - Del_h, m=mass)
    return Del_h / Del_t

fig, ax = plt.subplots()

# linear regressions!
masses = np.array([0.00096, 0.00192, 0.00285, 0.00385, 0.00475])
A = np.array([(1, np.log(v_exp(mass))) for mass in masses])
B = np.log(g * masses)
regression = np.linalg.lstsq(A, B, rcond=-1)[0][::-1]
best_fit = np.poly1d(regression)

# as you can tell, I'm tired of commenting and need to go to my homework
ax.plot(np.log(v_exp(masses)), best_fit(np.log(v_exp(masses))), label=r'$%f \ln(\bar{v}) %f$' % tuple(regression.tolist()))
ax.plot(np.log(v_exp(masses)), np.log(g * masses), 'ko', label='simulated data')

ax.set_xlabel(r'$\ln\bar{v}$')
ax.set_ylabel(r'$\ln mg$')
ax.legend()
fig.savefig('drag2_plot2.pdf', bbox_inches='tight')
plt.show()
