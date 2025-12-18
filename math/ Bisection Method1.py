import matplotlib.pyplot as plt

# Example function 
def f(x):
    return x**3 - x - 2

def bisection(a, b, tol, max_iter):
    # Check applicability condition of the method
    if f(a) * f(b) >= 0:
        raise ValueError("f(a) and f(b) must have opposite signs")

    data = []

    for i in range(max_iter):
        c = (a + b) / 2
        error = abs(b - a) / 2

        data.append((i, c, f(c), error))

        # Stopping condition
        if error < tol:
            break

        # Choose the new interval
        if f(a) * f(c) < 0:
            b = c
        else:
            a = c

    return c, data

# Function call

tol = 1e-6
max_iter = 50

root, table = bisection(1, 2, tol, max_iter)

# Print the table
for row in table:
    print(row)

# Convergence plot
errors = [row[3] for row in table]

plt.plot(errors)
plt.yscale('log')
plt.title('Bisection Convergence')
plt.xlabel('Iteration')
plt.ylabel('Error')
plt.show()
