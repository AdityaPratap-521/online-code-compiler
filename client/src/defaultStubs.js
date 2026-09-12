const stubs = {};

stubs.cpp = `#include <iostream>
using namespace std;

int main() {
    // Online Code Compiler C++ Starter Code
    // You can test custom input from the Test Case Input panel below
    int num;
    if (cin >> num) {
        cout << "Test Case Input Received: " << num << endl;
        cout << "Calculated Square: " << (num * num) << endl;
    } else {
        cout << "Hello World from Online C++ Compiler!" << endl;
        cout << "Enter custom numbers or text in Test Case Input." << endl;
    }
    return 0;
}
`;

stubs.python = `# Online Code Compiler Python 3 Starter Code
# You can test custom input from the Test Case Input panel below
import sys

def main():
    input_data = sys.stdin.read().strip()
    if input_data:
        print(f"Received Test Case Input:\n{input_data}")
        print(f"Total Character Length: {len(input_data)}")
    else:
        print("Hello World from Online Python 3 Compiler!")
        print("Enter custom input text in the panel below.")

if __name__ == "__main__":
    main()
`;

export default stubs;
