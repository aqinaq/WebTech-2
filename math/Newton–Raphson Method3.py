import matplotlib.pyplot as plt

# Test function
def f(x):
    return x**3 - x - 1

# Derivative (for Newton-Raphson)
def df(x):
    return 3*x**2 - 1
def g(x):
    return (x + 1)**(1/3)  # x = (x+1)^(1/3)

def newton_raphson(x0, tol=1e-6, max_iter=50):
    data = []
    x = x0
    for i in range(max_iter):
        if df(x) == 0:
            raise ValueError("Derivative is zero, method fails.")
        x_new = x - f(x)/df(x)
        error = abs(x_new - x)
        data.append((i, x_new, f(x_new), error))
        if error < tol:
            break
        x = x_new
    return x, data

root_nr, table_nr = newton_raphson(1.5)
print("Newton-Raphson Root:", root_nr)

for row in table_nr:
    print(row)

errors = [row[3] for row in table_nr]
plt.plot(errors, marker='o')
plt.yscale('log')
plt.title('Newton-Raphson Convergence')
plt.xlabel('Iteration')
plt.ylabel('Error')
plt.show()
