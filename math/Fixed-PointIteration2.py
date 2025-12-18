import matplotlib.pyplot as plt

# Исходная функция
def f(x):
    return x**3 - x - 1

# Функция итерации g(x)
def g(x):
    return (x + 1)**(1/3)


def fixed_point(x0, tol, max_iter):
    data = []

    x = x0  # начальное приближение

    for i in range(max_iter):
        x_new = g(x)
        error = abs(x_new - x)

        data.append((i, x_new, f(x_new), error))

        # критерий остановки
        if error < tol:
            break

        x = x_new

    return x, data


# ===============================
# ОСНОВНАЯ ЧАСТЬ ПРОГРАММЫ
# ===============================

x0 = 1.0          # начальное приближение
tol = 1e-6        # точность
max_iter = 100    # максимум итераций

root, data = fixed_point(x0, tol, max_iter)

# Вывод таблицы итераций
print("i\t x\t\t f(x)\t\t error")
for i, x, fx, err in data:
    print(f"{i}\t {x:.6f}\t {fx:.6e}\t {err:.2e}")

print("\nApproximate root:", root)

# График сходимости
iterations = [d[0] for d in data]
values = [d[1] for d in data]

plt.plot(iterations, values, marker='o')
plt.xlabel("Iteration")
plt.ylabel("x value")
plt.title("Fixed-Point Iteration Convergence")
plt.grid(True)
plt.show()
