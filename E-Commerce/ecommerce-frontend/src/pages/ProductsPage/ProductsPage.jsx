import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductsPage.css';

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') || '';

  // Synchronize component state with search params on load
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sort,
        };
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const { data } = await productsAPI.getAll(params);
        setProducts(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, minPrice, maxPrice, sort, page, search]);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Reset page to 1 when changing filters
    nextParams.set('page', '1');
    setPage(1);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams(search ? { search } : {});
    setPage(1);
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container page-wrapper" id="products-page">
      <div className="products-layout">
        {/* Sidebar Filters - Desktop */}
        <aside className={`filters-sidebar ${showMobileFilters ? 'mobile-show' : ''}`} id="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="mobile-close-btn" onClick={() => setShowMobileFilters(false)}>
              <FiX />
            </button>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              <button
                className={`filter-btn ${!category ? 'active' : ''}`}
                onClick={() => updateFilters({ category: '' })}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => updateFilters({ category: cat })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
              />
              <span className="price-range-to">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input"
              />
            </div>
            <button
              className="btn btn-outline btn-sm apply-price-btn"
              onClick={() => updateFilters({ minPrice, maxPrice })}
            >
              Apply Price
            </button>
          </div>

          {/* Clear Filters */}
          <button className="btn btn-ghost clear-all-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        {/* Main Product Grid Area */}
        <main className="products-main">
          {/* Top Bar (Results and Sort) */}
          <div className="products-topbar">
            <div className="search-status-text">
              {search && (
                <p>
                  Search results for "<span className="search-query-text">{search}</span>"
                </p>
              )}
              <p className="results-count">
                Showing {products.length} of {pagination.total || 0} products
              </p>
            </div>

            <div className="topbar-actions">
              <button
                className="btn btn-outline filter-toggle-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <FiFilter /> Filters
              </button>

              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="form-input sort-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ aspectRatio: '1/1' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '12px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
                    <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
                    <div className="skeleton" style={{ height: '20px', width: '30%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your search query or filter options</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Prev
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    disabled={page === pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
