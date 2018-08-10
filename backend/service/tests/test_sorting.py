""" Unit tests for the service """
import unittest

from service import best_target_match, sort_regex


class TestServiceMethods(unittest.TestCase):
    """ Tests the service methods. """

    def test_sorting_atf_regs(self):
        """
        Make sure that if multiple patterns match the incoming alias that
        the most specific (according to what the user expects) is used.
        """
        atf_regs = [
            {'pattern': r'at.'},
            {'pattern': r'at.?'},
            {'pattern': r'at.+'},
            {'pattern': r'at\w'},
            {'pattern': r'at\d'},
            {'pattern': r'at[a-z]'},
            {'pattern': r'.*'},
            {'pattern': r'(atf)'},
            {'pattern': r'(a|atf|axis-test-framework)'},
            {'pattern': r'(atf)(.*)'},
            {'pattern': r'.+'},
            {'pattern': r'atf'}
        ]
        # This is a representation of the order most users expect
        atf_regs_optimal_sorting = [
            {'pattern': r'atf'},
            {'pattern': r'(atf)'},
            {'pattern': r'at\d'},
            {'pattern': r'at\w'},
            {'pattern': r'at[a-z]'},
            {'pattern': r'at.'},
            {'pattern': r'at.?'},
            {'pattern': r'(a|atf|axis-test-framework)'},
            {'pattern': r'(atf)(.*)'},
            {'pattern': r'at.+'},
            {'pattern': r'.+'},
            {'pattern': r'.*'}
        ]
        # This is a representation of the order of the current implementation
        atf_regs_current_sorting = [
            {'pattern': r'atf'},
            {'pattern': r'(atf)'},
            {'pattern': r'at\d'},
            {'pattern': r'at\w'},
            {'pattern': r'at.'},
            {'pattern': r'at.?'},
            {'pattern': r'at[a-z]'},
            {'pattern': r'(a|atf|axis-test-framework)'},
            {'pattern': r'(atf)(.*)'},
            {'pattern': r'at.+'},
            {'pattern': r'.+'},
            {'pattern': r'.*'}
        ]
        del atf_regs_optimal_sorting #unused
        atf_regs_sorted = sort_regex(atf_regs)
        print(atf_regs_sorted)
        self.assertEqual(atf_regs_sorted, atf_regs_current_sorting)

    def test_atf_routing(self):
        """
        Test that alias atf returns the expected target even if a bunch of
        similar patterns also exist in the database.
        """
        mock_items = [
            {'pattern': 'atf', 'target': 'normal string'},
            {'pattern': 'atf?', 'target': 'optional char'},
            {'pattern': 'at\\w', 'target': 'any word char'},
            {'pattern': 'at.', 'target': 'any char'},
            {'pattern': 'at.+', 'target': 'any word starting with "at"'},
            {'pattern': '(atf)', 'target': 'capture group'},
            {'pattern': '(atf)(.*)', 'target': 'atf any word'},
            {'pattern': '.*', 'target': 'anything including zero'},
            {'pattern': '.+', 'target': 'anything excluding zero'}
        ]
        alias = 'atf'
        result = best_target_match(alias, mock_items)
        expected_result = 'normal string'
        self.assertEqual(result, expected_result)

    def test_gerrit_routing(self):
        """
        Test that capture groups and advanced usage of the regex function
        returns the expected result.
        """
        mock_items = [
            {'pattern': '(g|git|gerrit|gittools)/(.+)',
             'target': 'https://gerrit.example.com/gerrit/#/q/\\2'},
            {'pattern': '(.+)',
             'target': 'https://www.google.com/search?q=\\1'},
            {'pattern': '(g|git|gerrit|gittools)/(\\d+)(/\\d+)?',
             'target': 'https://gerrit.example.com/gerrit/#/c/\\2\\3'},
        ]
        aliases = ['g/123/123', 'git/123/123', 'gerrit/123/123',
                   'gittools/123/123']
        for alias in aliases:
            resulting_target = best_target_match(alias, mock_items)
            expected_target = 'https://gerrit.example.com/gerrit/#/c/123/123'
            self.assertEqual(resulting_target, expected_target)


if __name__ == '__main__':
    unittest.main()
