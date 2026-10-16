// src/components/state-admin/JurisdictionTreeNode.jsx
// Recursive component to render a hierarchical jurisdiction tree
// React concepts used:
// 1. Components (JurisdictionTreeNode)
// 2. Props (node, level, onAddChild, onEdit, filterArea)
// 3. State (useState for expanding / collapsing tree branches)
// 4. Events (onClick for toggle, add, edit buttons)
// 5. Lists (.map with key for rendering children)
// 6. Prop drilling (passing onAddChild, onEdit, filterArea down to recursive child nodes)
// 7. Callbacks (invoking onAddChild and onEdit to notify parent page)
// 8. Recursion (component renders itself for each child in node.children)

import React, { useState } from 'react';

// Friendly badge styling helpers for administrative tiers
const TIER_LABELS = {
  STATE: 'State Root',
  DISTRICT: 'District',
  SUB_DIVISION: 'Sub-Division',
  MANDAL: 'Mandal (Rural)',
  MUNICIPALITY: 'Municipality (Urban)',
  VILLAGE: 'Village',
  GRAM_PANCHAYAT: 'Gram Panchayat',
  WARD: 'Municipal Ward',
  ZONE: 'Urban Zone',
};

// Icons representing tier levels
const TIER_ICONS = {
  STATE: '🏛️',
  DISTRICT: '🏢',
  SUB_DIVISION: '📂',
  MANDAL: '🌾',
  MUNICIPALITY: '🏙️',
  VILLAGE: '🏡',
  GRAM_PANCHAYAT: '📜',
  WARD: '🏘️',
  ZONE: '📍',
};

/**
 * JurisdictionTreeNode component
 * Props:
 * - node {Object}: The jurisdiction node object { id, name, tierLevel, governanceType, children, ... }
 * - level {number}: Current indentation nesting depth (starts at 0)
 * - onAddChild {function}: Callback when clicking "+ Child" button
 * - onEdit {function}: Callback when clicking "Edit" button
 * - filterArea {string}: Current active area filter ('ALL', 'RURAL', 'URBAN')
 */
export default function JurisdictionTreeNode({
  // Props: node data and configuration passed from parent
  node,
  level = 0,
  onAddChild,
  onEdit,
  filterArea = 'ALL',
}) {
  // State: useState to track whether this node's children are expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(true);

  if (!node) return null;

  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;

  // Determine if this is a leaf node that cannot have child units
  const tier = node.tierLevel || node.type || 'DISTRICT';
  const isLeaf = ['VILLAGE', 'GRAM_PANCHAYAT', 'WARD', 'ZONE'].includes(tier);

  // Check governance match for filter highlights
  const govType = node.governanceType || node.areaType || 'COMMON';
  const matchesFilter =
    filterArea === 'ALL' ||
    govType === filterArea ||
    govType === 'COMMON';

  // Events: toggle expand / collapse handler
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Events & Callback: notify parent to open Add Child modal
  const handleAddChild = (e) => {
    e.stopPropagation();
    if (onAddChild) {
      // Callback: passing current node up to parent
      onAddChild(node);
    }
  };

  // Events & Callback: notify parent to edit this node
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      // Callback: passing current node up to parent
      onEdit(node);
    }
  };

  return (
    <div
      className="jurisdiction-tree-branch"
      style={{
        marginTop: '6px',
        opacity: matchesFilter ? 1 : 0.45,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Node display card with indentation based on level */}
      <div
        style={{
          marginLeft: `${level * 22}px`,
          padding: '10px 14px',
          background: level === 0 ? '#f8fafc' : '#ffffff',
          border: level === 0 ? '2px solid #cbd5e1' : '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Left Side: Toggle button, Icon, Name, and Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Expand / Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={handleToggle}
              style={{
                width: '24px',
                height: '24px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#334155',
                padding: 0,
              }}
              title={isExpanded ? 'Collapse sub-units' : 'Expand sub-units'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span style={{ width: '24px', display: 'inline-block' }} />
          )}

          {/* Node Icon */}
          <span style={{ fontSize: '1.2rem' }}>{TIER_ICONS[tier] || '📍'}</span>

          {/* Name & Identifiers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
              {node.name}
            </span>

            {node.code && (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {node.code}
              </span>
            )}

            {/* Tier Level Badge */}
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#1e293b',
                background: '#e2e8f0',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {TIER_LABELS[tier] || tier}
            </span>

            {/* Governance Type Badge (Rural / Urban / Common) */}
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                background: govType === 'RURAL' ? '#dcfce7' : govType === 'URBAN' ? '#e0f2fe' : '#f3e8ff',
                color: govType === 'RURAL' ? '#15803d' : govType === 'URBAN' ? '#0369a1' : '#7e22ce',
              }}
            >
              {govType}
            </span>

            {/* Inactive badge if applicable */}
            {node.status === 'Inactive' && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                }}
              >
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {hasChildren && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginRight: '6px' }}>
              {children.length} {children.length === 1 ? 'unit' : 'units'}
            </span>
          )}

          {/* Edit Boundary Name Button (triggers parent onEdit callback) */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleEdit}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            title="Edit boundary details"
          >
            ✏️ Edit
          </button>

          {/* Add Child Node Button (hidden for leaf units like Villages / Wards) */}
          {!isLeaf && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAddChild}
              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
              title={`Add subordinate unit under ${node.name}`}
            >
              + Child
            </button>
          )}
        </div>
      </div>

      {/* Recursion & Lists: Map over node.children and render JurisdictionTreeNode again */}
      {hasChildren && isExpanded && (
        <div className="jurisdiction-children-container" style={{ position: 'relative' }}>
          {/* Lists: map with unique key */}
          {children.map((childNode) => (
            // Recursion: Component rendering itself for each child
            // Prop drilling: passing onAddChild, onEdit, filterArea down to child
            <JurisdictionTreeNode
              key={childNode.id || childNode.name}
              node={childNode}
              level={level + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              filterArea={filterArea}
            />
          ))}
        </div>
      )}
    </div>
  );
}
