
# This test file contains all the tests that will be
# executed everytime someone makes a pull request or
# pushes to the main branch.

# Example test: function(1) == 7 is correct so this
# test_function will pass.
def function(x):
    y = 6
    return x + y


def test_function():
    assert function(1) == 7, "Test failed"


#
# Add unit tests here
# Name it test_*function name*.py or pytest won't find it.
#


#
# Add integration tests here
#


#
# Add system tests here
#
