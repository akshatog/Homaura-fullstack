import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce, getSuggestions, getSearchHistory, clearSearchHistory } from '../utils/searchUtils';
import ProductImage from './ProductImage';
import { IMAGE_SIZES } from '../utils/imageUtils';
import './SearchBar.css';

const SearchBar = ({ products, onSearch, onClear }) => {
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('suggestions');
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setSearchHistory(getSearchHistory());
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const debouncedGetSuggestions = useCallback(
        debounce((searchQuery) => {
            if (searchQuery.length >= 2) {
                const newSuggestions = getSuggestions(searchQuery, products, 6);
                setSuggestions(newSuggestions);
                setActiveTab('suggestions');
            } else {
                setSuggestions([]);
            }
        }, 300),
        [products]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            debouncedGetSuggestions(value);
            onSearch(value);
        } else {
            setSuggestions([]);
            onClear();
        }
    };

    const handleFocus = () => {
        setShowDropdown(true);
        if (!query.trim()) {
            setActiveTab('history');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'product' && suggestion.product) {
            navigate(`/products/${suggestion.product.id}`);
            setShowDropdown(false);
            setQuery('');
        } else if (suggestion.type === 'category' || suggestion.type === 'badge') {
            setQuery(suggestion.text);
            onSearch(suggestion.text);
            setShowDropdown(false);
        }
    };

    const handleHistoryClick = (historyItem) => {
        setQuery(historyItem.query);
        onSearch(historyItem.query);
        setShowDropdown(false);
    };

    const handleClearHistory = () => {
        clearSearchHistory();
        setSearchHistory([]);
    };

    const handleClear = () => {
        setQuery('');
        onClear();
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className="search-bar-container" ref={searchRef}>
            <div className="search-bar">
                <div className="search-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search products, categories, or tags..."
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                />

                {query && (
                    <button className="search-clear" onClick={handleClear}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M12 4L4 12M4 4l8 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showDropdown && (suggestions.length > 0 || searchHistory.length > 0) && (
                    <motion.div
                        className="search-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {query.length >= 2 && suggestions.length > 0 ? (
                            <div className="dropdown-section">
                                <div className="dropdown-header">
                                    <span>Suggestions</span>
                                </div>
                                <div className="suggestions-list">
                                    {suggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            whileHover={{ backgroundColor: 'rgba(92, 107, 71, 0.06)' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {suggestion.type === 'product' && suggestion.product && (
                                                <>
                                                    <div className="suggestion-image">
                                                        <ProductImage product={suggestion.product} width={IMAGE_SIZES.search} alt={suggestion.text} />
                                                    </div>
                                                    <div className="suggestion-content">
                                                        <div className="suggestion-text">{suggestion.text}</div>
                                                        <div className="suggestion-meta">{suggestion.product.category}</div>
                                                    </div>
                                                </>
                                            )}
                                            {(suggestion.type === 'category' || suggestion.type === 'badge') && (
                                                <>
                                                    <div className="suggestion-icon">
                                                        {suggestion.type === 'category' ? '📁' : '🏷️'}
                                                    </div>
                                                    <div className="suggestion-content">
                                                        <div className="suggestion-text">{suggestion.text}</div>
                                                        <div className="suggestion-meta">{suggestion.count} products</div>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            searchHistory.length > 0 && (
                                <div className="dropdown-section">
                                    <div className="dropdown-header">
                                        <span>Recent Searches</span>
                                        <button className="clear-history-btn" onClick={handleClearHistory}>
                                            Clear
                                        </button>
                                    </div>
                                    <div className="history-list">
                                        {searchHistory.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                className="history-item"
                                                onClick={() => handleHistoryClick(item)}
                                                whileHover={{ backgroundColor: 'rgba(92, 107, 71, 0.06)' }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="history-icon">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path
                                                            d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                        />
                                                        <path
                                                            d="M8 4v4l2 2"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </div>
                                                {item.topProduct && (
                                                    <div className="history-image">
                                                        <ProductImage product={item.topProduct} width={IMAGE_SIZES.search} alt={item.query} />
                                                    </div>
                                                )}
                                                <div className="history-content">
                                                    <div className="history-query">{item.query}</div>
                                                    <div className="history-meta">{item.resultCount} results</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
