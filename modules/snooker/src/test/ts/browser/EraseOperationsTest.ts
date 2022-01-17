import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

UnitTest.test('EraseOperationsTest', () => {
  const deleteExpected1 = '<table><tbody>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';

  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    Optional.some(deleteExpected1),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 1, column: 0 }
    ]
  );

  const deleteExpected2 = '<table><tbody>' +
    '<tr><td>C1</td><td>D1</td></tr>' +
    '<tr><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected2),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 0, column: 1 }
    ]
  );

  const deleteExpected3 = '<table><tbody>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    Optional.some(deleteExpected3),

    '<table><tbody>' +
    '<tr><th>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 1, column: 0 }
    ]
  );

  const deleteExpected4 = '<table><tbody>' +
    '<tr><th colspan="2">A1</th><td>D1</td></tr>' +
    '<tr><th>A2</th><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 1 }),
    Optional.some(deleteExpected4),

    '<table><tbody>' +
    '<tr><th colspan="3">A1</th><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 1, column: 1 }
    ]
  );

  const deleteExpected5 = '<table><tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected5),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected6 = '<table><tbody>' +
    '<tr><th>A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected6),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '<tr><th>A3</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 0 }
    ]
  );

  const deleteExpected7 = '<table><tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected7),

    '<table><tbody>' +
    '<tr><th>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected8 = '<table><tbody>' +
    '<tr><th rowspan="2">A1</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected8),

    '<table><tbody>' +
    '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected9 = '<table border="1">' +
    '<tbody><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected9),

    '<table border="1">' +
    '<tbody><tr><td colspan="2">AB</td><td>C</td></tr>' +
    '<tr><td>D</td><td>E</td><td>F</td></tr>' +
    '<tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 },
      { section: 0, row: 1, column: 2 }
    ]
  );

  const deleteExpected10 = '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td colspan="2">33 34 43 44 53 54 </td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 2 }),
    Optional.some(deleteExpected10),

    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 1, column: 2 },
      { section: 0, row: 3, column: 2 },
      { section: 0, row: 4, column: 2 }
    ]
  );

  const deleteExpected11 = '<table border="1">' +
    '<tbody>' +
    '<tr><td>0</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr>' +
    '</tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 1 }),
    Optional.some(deleteExpected11),

    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 1, column: 1 },
      { section: 0, row: 3, column: 1 },
      { section: 0, row: 4, column: 1 }
    ]
  );

  const deleteExpected12 =
    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 3, column: 3 }),
    Optional.some(deleteExpected12),

    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 3, column: 3 }
    ]
  );

  const deleteExpected13 =
    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td colspan="2" rowspan="2">33 34 43 44 53 54 </td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 3, column: 3 }),
    Optional.some(deleteExpected13),

    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 3, column: 3 }
    ]
  );

  const deleteExpected14 = '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 4, column: 7 }),
    Optional.some(deleteExpected14),

    '<table border="1">' +
    '<tbody><tr><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>' +
    '<tr><td>10</td><td rowspan="2">11 21</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>' +
    '<tr><td>20</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>' +
    '<tr><td>30</td><td>31</td><td>32</td><td colspan="2" rowspan="3">33 34 43 44 53 54 </td><td>35</td><td>36</td><td>37</td><td>38</td><td>39</td></tr>' +
    '<tr><td>40</td><td>41</td><td>42</td><td>45</td><td>46</td><td>47</td><td>48</td><td>49</td></tr>' +
    '<tr><td>50</td><td>51</td><td>52</td><td>55</td><td>56</td><td>57</td><td>58</td><td>59</td></tr>' +
    '<tr><td>60</td><td>61</td><td>62</td><td>63</td><td>64</td><td>65</td><td>66</td><td>67</td><td>68</td><td>69</td></tr>' +
    '<tr><td>70</td><td>71</td><td>72</td><td>73</td><td>74</td><td>75</td><td>76</td><td>77</td><td>78</td><td>79</td></tr>' +
    '<tr><td>80</td><td>81</td><td>82</td><td>83</td><td>84</td><td>85</td><td>86</td><td>87</td><td>88</td><td>89</td></tr>' +
    '<tr><td>90</td><td>91</td><td>92</td><td>93</td><td>94</td><td>95</td><td>96</td><td>97</td><td>98</td><td>99</td></tr></tbody>' +
    '</table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 4, column: 5 },
      { section: 0, row: 5, column: 5 }
    ]
  );

  const deleteExpected15 =
    '<table border="1"><tbody>' +
    '<tr><td>row 0 cell 0 row 1 cell 0 </td><td>row 1 cell 1</td><td rowspan="2">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 1 }),
    Optional.some(deleteExpected15),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 1 }
    ]
  );

  const deleteExpected16 =
    '<table border="1"><tbody>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td><td>row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 1 }),
    Optional.some(deleteExpected16),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 1 },
      { section: 0, row: 1, column: 0 }  // Note: this one is 0 because hierarchy doesn't account for merged cells, here we are actually targeting cell 1,1 but in the dom structure is in position 0
    ]
  );

  const deleteExpected17 =
    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr></tr>' +
    '<tr><td>row 2 cell 0</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 1 }),
    Optional.some(deleteExpected17),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 1 },
      { section: 0, row: 1, column: 0 } // Note: this one is 0 because hierarchy doesn't account for merged cells, here we are actually targeting cell 1,1 but in the dom structure is in position 0
    ]
  );

  const deleteExpected18 =
    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td></tr>' +
    '<tr></tr>' +
    '<tr><td>row 2 cell 0</td></tr>' +
    '<tr><td>row 3 cell 0</td></tr>' +
    '<tr><td>row 4 cell 0</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 2, column: 0 }),
    Optional.some(deleteExpected18),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 2 },
      { section: 0, row: 2, column: 1 },
      { section: 0, row: 3, column: 1 },
      { section: 0, row: 3, column: 2 },
      { section: 0, row: 4, column: 1 },
      { section: 0, row: 4, column: 2 }
    ]
  );

  Assertions.checkDelete(
    'TBA',
    Optional.none(),
    Optional.none(),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 2 },
      { section: 0, row: 2, column: 1 },
      { section: 0, row: 3, column: 1 },
      { section: 0, row: 3, column: 2 },
      { section: 0, row: 4, column: 1 },
      { section: 0, row: 4, column: 2 }
    ]
  );

  Assertions.checkDelete(
    'TBA',
    Optional.none(),
    Optional.none(),

    '<table border="1"><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 4, column: 0 },
      { section: 0, row: 4, column: 1 },
      { section: 0, row: 4, column: 2 }
    ]
  );

  const deleteExpected19 = '<table><tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected19),

    '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected20 = '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected20),

    '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 1, row: 0, column: 0 }
    ]
  );

  Assertions.checkDelete(
    'TBA',
    Optional.none(),
    Optional.none(),

    '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 },
      { section: 1, row: 0, column: 0 }
    ]
  );

  const deleteExpected21 = '<table><thead>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected21),

    '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected22 = '<table><thead>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected22),

    '<table><thead>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 0 },
      { section: 1, row: 0, column: 0 }
    ]
  );

  const deleteExpected23 = '<table><tbody>' +
    '<tr><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';

  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    Optional.some(deleteExpected23),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td rowspan="2">B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 1, column: 0 }
    ]
  );

  const deleteExpected24 = '<table><tbody>' +
    '<tr><th>A2</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    Optional.some(deleteExpected24),

    '<table><tbody>' +
    '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><th>A2</th><td rowspan="2">B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 0, column: 0 }
    ]
  );

  const deleteExpected25 = generateTestTable(
    [ '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' ],
    [], [],
    { numCols: 3, colgroup: true, lockedColumns: [] }
  );
  Assertions.checkDelete(
    'Check that columns in a colgroup table can be erased',
    Optional.some({ section: 1, row: 0, column: 0 }),
    Optional.some(deleteExpected25),

    generateTestTable(
      [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [] }
    ),

    TableOperations.eraseColumns,
    [
      { section: 1, row: 0, column: 0 }
    ]
  );

  const deleteExpected26 = generateTestTable(
    [ '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' ],
    [], [],
    { numCols: 4, colgroup: true, lockedColumns: [] }
  );
  Assertions.checkDelete(
    'Check that rows in a colgroup table can be erased',
    Optional.some({ section: 1, row: 0, column: 0 }),
    Optional.some(deleteExpected26),

    generateTestTable(
      [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>', '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>' ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [] }
    ),

    TableOperations.eraseRows,
    [
      { section: 1, row: 0, column: 0 }
    ]
  );

  const deleteExpected27 = generateTestTable(
    [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' ],
    [], [],
    { numCols: 4, colgroup: true, lockedColumns: [ 0 ] }
  );
  Assertions.checkDelete(
    'TINY-6765: Check that selected locked column cannot be erased',
    Optional.none(),
    Optional.some(deleteExpected27),

    generateTestTable(
      [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.eraseColumns,
    [
      { section: 1, row: 0, column: 0 }
    ]
  );

  const deleteExpected28 = generateTestTable(
    [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' ],
    [], [],
    { numCols: 4, colgroup: true, lockedColumns: [ 0 ] }
  );
  Assertions.checkDelete(
    'TINY-6765: Check that locked columns does not affect erasing rows',
    Optional.none(),
    Optional.some(deleteExpected28),

    generateTestTable(
      [
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>',
        '<tr><td>A3</td><td>B3</td><td>C3</td><td>D3</td></tr>'
      ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.eraseRows,
    [
      { section: 1, row: 1, column: 1 }
    ]
  );

  const deleteExpected29 = generateTestTable(
    [ '<tr><td>A2</td><td>C2</td></tr>' ],
    [], [],
    { numCols: 2, colgroup: true, lockedColumns: [ 0, 1 ] }
  );
  Assertions.checkDelete(
    'TINY-6765: Check that for a multi-column selection, non-locked columns are erased and locked columns are kept',
    Optional.none(),
    Optional.some(deleteExpected29),

    generateTestTable(
      [ '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 0, 2 ] }
    ),

    TableOperations.eraseColumns,
    [
      { section: 1, row: 0, column: 0 },
      { section: 1, row: 0, column: 1 },
      { section: 1, row: 0, column: 2 },
      { section: 1, row: 0, column: 3 },
    ]
  );

  const deleteExpected30 =
    '<table><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '</tbody></table>';
  Assertions.checkDelete(
    'TINY-7695: Deleting the last 2 rows should keep the cursor in the last row',
    Optional.some({ section: 0, row: 2, column: 1 }),
    Optional.some(deleteExpected30),

    '<table><tbody>' +
    '<tr><td rowspan="2">row 0 cell 0 row 1 cell 0 </td><td>row 0 cell 1</td><td rowspan="3">row 0 cell 2 row 1 cell 2 row 2 cell 2 </td></tr>' +
    '<tr><td>row 1 cell 1</td></tr>' +
    '<tr><td>row 2 cell 0</td><td>row 2 cell 1</td></tr>' +
    '<tr><td>row 3 cell 0</td><td>row 3 cell 1</td><td>row 3 cell 2</td></tr>' +
    '<tr><td>row 4 cell 0</td><td>row 4 cell 1</td><td>row 4 cell 2</td></tr>' +
    '</tbody></table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 3, column: 1 },
      { section: 0, row: 3, column: 2 },
      { section: 0, row: 4, column: 1 },
      { section: 0, row: 4, column: 2 },
    ]
  );

  const deleteExpected31 = '<table>' +
    '<tbody>' +
      '<tr><td contenteditable="false">A1</td><td>B1</td></tr>' +
    '</tbody>' +
  '</table>';
  Assertions.checkDelete(
    'TINY-7695: Deleting the last row should not move the selection into a cef element',
    Optional.some({ section: 0, row: 0, column: 1 }),
    Optional.some(deleteExpected31),

    '<table>' +
      '<tbody>' +
        '<tr><td contenteditable="false">A1</td><td>B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
      '</tbody>' +
    '</table>',

    TableOperations.eraseRows,
    [
      { section: 0, row: 1, column: 0 },
      { section: 0, row: 1, column: 1 }
    ]
  );

  const deleteExpected32 = '<table>' +
    '<tbody>' +
    '<tr><td contenteditable="false">A1</td></tr>' +
    '<tr><td>A2</td></tr>' +
    '</tbody>' +
    '</table>';
  Assertions.checkDelete(
    'TINY-7695: Deleting the last column should not move the selection into a cef element',
    Optional.some({ section: 0, row: 1, column: 0 }),
    Optional.some(deleteExpected32),

    '<table>' +
    '<tbody>' +
    '<tr><td contenteditable="false">A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody>' +
    '</table>',

    TableOperations.eraseColumns,
    [
      { section: 0, row: 0, column: 1 },
      { section: 0, row: 1, column: 1 }
    ]
  );
});
