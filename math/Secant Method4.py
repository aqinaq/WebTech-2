import matplotlib.pyplot as plt

# Test function
def f(x):
    return x**3 - x - 1

def secant(x0, x1, tol=1e-6, max_iter=50):
    data = []
    for i in range(max_iter):
        if f(x1)-f(x0) == 0:
            raise ValueError("Division by zero in Secant method")
        x_new = x1 - f(x1)*(x1 - x0)/(f(x1) - f(x0))
        error = abs(x_new - x1)
        data.append((i, x_new, f(x_new), error))
        if error < tol:
            break
        x0, x1 = x1, x_new
    return x_new, data

root_sec, table_sec = secant(1, 2)
print("Secant Root:", root_sec)

for row in table_sec:
    print(row)

errors = [row[3] for row in table_sec]
plt.plot(errors, marker='o')
plt.yscale('log')
plt.title('Secant Convergence')
plt.xlabel('Iteration')
plt.ylabel('Error')
plt.show()
