#include <bits/stdc++.h>
#define lson u << 1
#define rson u << 1 | 1
int min[int(1e6) + 7], n, q, a, b;
char op;
void pushup(int u) { min[u] = std::min(min[lson], min[u << 1 | 1]); }
void arnold(int aim, int val, int l = 1, int r = n, int u = 1) {
    if (l == r) min[u] = val;
    else {
        int mid = l + r >> 1;
        if (aim <= mid) arnold(aim, val, l, mid, lson);
        else arnold(aim, val, mid + 1, r, u << 1 | 1);
        pushup(u);
    }
}
int nimo(int begin, int end, int l = 1, int r = n, int u = 1) {
    if (begin <= l && r <= end) return min[u];
    int mid = l + r >> 1;
    if (end <= mid) return nimo(begin, end, l, mid, lson);
    else if (begin > mid) return nimo(begin, end, mid + 1, r, u << 1 | 1);
    return std::min(nimo(begin, end, l, mid, lson), nimo(begin, end, mid + 1, r, u << 1 | 1));
}
int main() {
    memset(min, 0x7f, sizeof(min));
    std::cin>>n>>q;
    while (q--) {
        std::cin>>op>>a>>b;
        char code = op;
        if (code == 'M'){ arnold(b, a);}
        else {
            int l = b, r = n, mid, ans = -1;
            while (l <= r) {
                mid = l + r >> 1;
                if (nimo(l, mid) <= a) r = mid - 1, ans = mid;
                else l = mid + 1;
            }
            std::cout<<ans<<"/n";
        }
    }
    return 0;
}