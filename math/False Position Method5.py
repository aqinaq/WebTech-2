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

    data = []
    for i in range(max_iter):
        c = b - f(b)*(b - a)/(f(b) - f(a))
        error = abs(f(c))
        data.append((i, c, f(c), error))
        if error < tol:
            break
        if f(a)*f(c) < 0:
            b = c
        else:
            a = c
    return c, data

root_fpst, table_fpst = false_position(1, 2)
print("False Position Root:", root_fpst)

for row in table_fpst:
    print(row)

errors = [row[3] for row in table_fpst]
plt.plot(errors, marker='o')
plt.yscale('log')
plt.title('False Position Convergence')
plt.xlabel('Iteration')
plt.ylabel('Error')
plt.show()
