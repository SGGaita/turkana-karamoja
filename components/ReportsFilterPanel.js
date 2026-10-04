import { Box, Typography, Button, Chip, TextField, Autocomplete, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { HUB_COUNTRIES, getCountryLabel } from '../lib/countries';

export const FILTER_SIDEBAR_WIDTH = 300;

const fieldSx = {
  bgcolor: '#fff',
  fontSize: '0.82rem',
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: 1.5,
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E4D4C4' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C9A27A' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
};

function FilterField({ icon: Icon, label, accent, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.9 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            bgcolor: `${accent}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 14, color: accent }} />
        </Box>
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#3D2B1F',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

export default function ReportsFilterPanel({
  search,
  onSearchChange,
  categories,
  filterCategories,
  onCategoriesChange,
  orgs,
  filterOrg,
  onOrgChange,
  keywords,
  filterKeywords,
  onKeywordsChange,
  filterCountries,
  onCountriesChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  hasActiveFilters,
  onClear,
  onSearchClear,
}) {
  const activeCount = [
    search ? 1 : 0,
    filterOrg ? 1 : 0,
    filterCategories.length,
    filterKeywords.length,
    filterCountries.length,
    dateFrom || dateTo ? 1 : 0,
  ].reduce((sum, n) => sum + n, 0);

  return (
    <Box
      sx={{
        width: { xs: '100%', md: FILTER_SIDEBAR_WIDTH },
        flex: { xs: '1 1 auto', md: `0 0 ${FILTER_SIDEBAR_WIDTH}px` },
        position: { md: 'sticky' },
        top: { md: 96 },
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid #D9C4A8',
        boxShadow: '0 8px 24px rgba(61, 43, 31, 0.08)',
        bgcolor: '#F7F0E6',
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 1.75,
          background: 'linear-gradient(135deg, #3D2B1F 0%, #6B4226 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FilterAltOutlinedIcon sx={{ fontSize: 18, color: '#F0D9B0' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              Filters
            </Typography>
            {activeCount > 0 && (
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  px: 0.6,
                  borderRadius: 999,
                  bgcolor: '#C1440E',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activeCount}
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.72)', mt: 0.4, pl: 3.2 }}>
            Narrow the reports library
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onClear}
          disabled={!hasActiveFilters}
          startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
          sx={{
            color: hasActiveFilters ? '#F0D9B0' : 'rgba(255,255,255,0.35)',
            fontSize: '0.7rem',
            textTransform: 'none',
            minWidth: 0,
            px: 0.75,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.28)' },
          }}
        >
          Clear
        </Button>
      </Box>

      <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        <FilterField icon={SearchIcon} label="Search" accent="#6B4226">
          <TextField
            placeholder="Title, description, or tag…"
            value={search}
            onChange={onSearchChange}
            size="small"
            fullWidth
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#9A9A9A' }} />
                </InputAdornment>
              ),
            }}
          />
        </FilterField>

        <FilterField icon={CategoryOutlinedIcon} label="Category" accent="#2E7BB4">
          <Autocomplete
            multiple
            size="small"
            options={categories}
            value={filterCategories}
            onChange={(_, val) => onCategoriesChange(val)}
            disableCloseOnSelect
            limitTags={0}
            getLimitTagsText={(more) => `${more} selected`}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={filterCategories.length ? '' : 'Choose a report type…'}
                sx={fieldSx}
              />
            )}
          />
        </FilterField>

        <FilterField icon={BusinessOutlinedIcon} label="Organisation" accent="#C1440E">
          <Autocomplete
            size="small"
            options={orgs}
            value={filterOrg || null}
            onChange={(_, val) => onOrgChange(val || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Choose an organisation…"
                sx={fieldSx}
              />
            )}
          />
        </FilterField>

        <FilterField icon={LocalOfferOutlinedIcon} label="Keyword" accent="#6D28D9">
          <Autocomplete
            multiple
            size="small"
            options={keywords}
            value={filterKeywords}
            onChange={(_, val) => onKeywordsChange(val)}
            disableCloseOnSelect
            limitTags={0}
            getLimitTagsText={(more) => `${more} selected`}
            noOptionsText={keywords.length ? 'No matching keywords' : 'No extra keywords beyond categories'}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={filterKeywords.length ? '' : 'Topic tags only…'}
                sx={fieldSx}
              />
            )}
          />
        </FilterField>

        <FilterField icon={PublicOutlinedIcon} label="Country" accent="#2E7040">
          <Autocomplete
            multiple
            size="small"
            options={HUB_COUNTRIES.map((c) => c.code)}
            getOptionLabel={(code) => getCountryLabel(code)}
            value={filterCountries}
            onChange={(_, val) => onCountriesChange(val)}
            disableCloseOnSelect
            limitTags={0}
            getLimitTagsText={(more) => `${more} selected`}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={filterCountries.length ? '' : 'Kenya, Uganda, or regional…'}
                sx={fieldSx}
              />
            )}
          />
        </FilterField>

        <FilterField icon={CalendarMonthOutlinedIcon} label="Published between" accent="#B45309">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              type="date"
              size="small"
              label="From"
              fullWidth
              value={dateFrom}
              onChange={onDateFromChange}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              fullWidth
              value={dateTo}
              onChange={onDateToChange}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Box>
        </FilterField>
      </Box>

      {hasActiveFilters && (
        <Box sx={{ px: 2.25, pb: 2.25 }}>
          <Box sx={{ borderTop: '1px dashed #D4C4B0', pt: 1.75 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8A7058', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1 }}>
              Active filters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
              {search && (
                <Chip
                  label={`Search: “${search}”`}
                  onDelete={onSearchClear}
                  size="small"
                  sx={{ bgcolor: '#EDE4D8', color: '#6B4226', fontSize: '0.68rem', fontWeight: 600 }}
                />
              )}
              {filterCategories.map((c) => (
                <Chip
                  key={`cat-${c}`}
                  label={`Category: ${c}`}
                  onDelete={() => onCategoriesChange(filterCategories.filter((x) => x !== c))}
                  size="small"
                  sx={{ bgcolor: '#E0EFF8', color: '#2E7BB4', fontSize: '0.68rem', fontWeight: 600 }}
                />
              ))}
              {filterOrg && (
                <Chip
                  label={`Org: ${filterOrg}`}
                  onDelete={() => onOrgChange('')}
                  size="small"
                  sx={{ bgcolor: '#FDE8DC', color: '#C1440E', fontSize: '0.68rem', fontWeight: 600 }}
                />
              )}
              {filterKeywords.map((k) => (
                <Chip
                  key={`kw-${k}`}
                  label={`Keyword: ${k}`}
                  onDelete={() => onKeywordsChange(filterKeywords.filter((x) => x !== k))}
                  size="small"
                  sx={{ bgcolor: '#EDE7F6', color: '#6D28D9', fontSize: '0.68rem', fontWeight: 600 }}
                />
              ))}
              {filterCountries.map((code) => (
                <Chip
                  key={`co-${code}`}
                  label={`Country: ${getCountryLabel(code)}`}
                  onDelete={() => onCountriesChange(filterCountries.filter((x) => x !== code))}
                  size="small"
                  sx={{ bgcolor: '#EAF3EC', color: '#2E7040', fontSize: '0.68rem', fontWeight: 600 }}
                />
              ))}
              {(dateFrom || dateTo) && (
                <Chip
                  label={`Dates: ${dateFrom || '…'} → ${dateTo || '…'}`}
                  onDelete={() => {
                    onDateFromChange({ target: { value: '' } });
                    onDateToChange({ target: { value: '' } });
                  }}
                  size="small"
                  sx={{ bgcolor: '#FFF4E5', color: '#B45309', fontSize: '0.68rem', fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
