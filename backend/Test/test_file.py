
# This test file contains all the tests that will be
# executed everytime someone makes a pull request or
# pushes to the main branch.

# Test example: function(1) == 7 is correct so this
# test_function will pass.
def function(x):
    y = 6
    return x + y


def test_function():
    assert function(1) == 7, "Test failed"
