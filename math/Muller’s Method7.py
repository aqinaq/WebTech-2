import matplotlib.pyplot as plt

# Test function
def f(x):
    return x**3 - x - 1

# Derivative (for Newton-Raphson)
def df(x):
    return 3*x**2 - 1
def g(x):
    return (x + 1)**(1/3)  # x = (x+1)^(1/3)

def false_position(a, b, tol=1e-6, max_iter=50):
    if f(a)*f(b) >= 0:
        raise ValueError("f(a) and f(b) must have opposite signs")
import cmath

def muller(x0, x1, x2, tol=1e-6, max_iter=50):
    data = []
    for i in range(max_iter):
        h1 = x1 - x0
        h2 = x2 - x1
        δ1 = (f(x1) - f(x0))/h1
        δ2 = (f(x2) - f(x1))/h2
        d = (δ2 - δ1)/(h2 + h1)
        b = δ2 + h2*d
        D = cmath.sqrt(b**2 - 4*f(x2)*d)
        if abs(b - D) < abs(b + D):
            E = b + D
        else:
            E = b - D
        x3 = x2 - 2*f(x2)/E
        error = abs(x3 - x2)
        data.append((i, x3, f(x3), error))
        if error < tol:
            break
        x0, x1, x2 = x1, x2, x3
    return x3, data

root_mull, table_mull = muller(0, 1, 2)
print("Muller Root:", root_mull)

for row in table_mull:
    print(row)

errors = [row[3] for row in table_mull]
plt.plot(errors, marker='o')
plt.yscale('log')
plt.title("Muller's Convergence")
plt.xlabel("Iteration")
plt.ylabel("Error")
plt.show()
