import { useState } from 'react';
import { Zap, Shield, AlertTriangle, Check, X, Clock, User, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { mockRemediationPermissions } from '@/features/admin/data/adminData';
import { RemediationPermission } from '@/shared/types';
import { useToast } from '@/shared/hooks/use-toast';

export function AutoRemediationSection() {
  const [permissions, setPermissions] = useState(mockRemediationPermissions);
  const [approvalDialog, setApprovalDialog] = useState<RemediationPermission | null>(null);
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const styles = {
      low: 'bg-status-success/20 text-status-success border-status-success/30',
      medium: 'bg-severity-medium/20 text-severity-medium border-severity-medium/30',
      high: 'bg-severity-high/20 text-severity-high border-severity-high/30',
    };
    return styles[risk];
  };

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    if (risk === 'low') return <Shield className="h-4 w-4" />;
    if (risk === 'medium') return <AlertTriangle className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const handleApprove = (permission: RemediationPermission) => {
    setApprovalDialog(permission);
    setJustification('');
  };

  const confirmApproval = () => {
    if (!approvalDialog) return;
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === approvalDialog.id
          ? {
            ...p,
            approved: true,
            approvedBy: 'current.user@company.com',
            approvedAt: new Date().toISOString(),
          }
          : p
      )
    );
    toast({
      title: 'Action Approved',
      description: `"${approvalDialog.name}" has been enabled for auto-remediation.`,
      variant: 'success',
    });
    setApprovalDialog(null);
  };

  const handleRevoke = (permission: RemediationPermission) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permission.id
          ? { ...p, approved: false, approvedBy: undefined, approvedAt: undefined }
          : p
      )
    );
    toast({
      title: 'Action Revoked',
      description: `"${permission.name}" has been disabled.`,
      variant: 'destructive',
    });
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, RemediationPermission[]>);

  const approvedCount = permissions.filter((p) => p.approved).length;
  const pendingCount = permissions.filter((p) => !p.approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auto Remediation</h1>
          <p className="text-muted-foreground">Manage Permissions for Automated Remediation Actions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-success/20">
              <Check className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-severity-medium/20">
              <Clock className="h-5 w-5 text-severity-medium" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{permissions.length}</p>
              <p className="text-sm text-muted-foreground">Total Permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">About Auto Remediation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Auto remediation allows the system to automatically execute predefined actions in response to detected issues.
            Each permission requires explicit approval before it can be used. High-risk actions require additional justification.
          </p>
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{category}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryPermissions.map((permission) => (
                <div key={permission.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getRiskBadge(permission.riskLevel)}`}>
                        {getRiskIcon(permission.riskLevel)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{permission.name}</h3>
                        <Badge className={getRiskBadge(permission.riskLevel)}>
                          {permission.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={permission.approved}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleApprove(permission);
                        } else {
                          handleRevoke(permission);
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{permission.description}</p>

                  {permission.approved && permission.approvedBy && (
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Approved by {permission.approvedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(permission.approvedAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Approval Dialog */}
      <Dialog open={!!approvalDialog} onOpenChange={(open) => !open && setApprovalDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Auto Remediation</DialogTitle>
            <DialogDescription>
              You are about to approve automatic execution of this action.
            </DialogDescription>
          </DialogHeader>

          {approvalDialog && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{approvalDialog.name}</h3>
                  <Badge className={getRiskBadge(approvalDialog.riskLevel)}>
                    {approvalDialog.riskLevel} risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{approvalDialog.description}</p>
              </div>

              {approvalDialog.riskLevel === 'high' && (
                <div className="bg-severity-high/10 border border-severity-high/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-severity-high mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-sm">High Risk Action</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This action carries significant risk. Please provide a justification for approval.
                  </p>
                </div>
              )}

              {(approvalDialog.riskLevel === 'high' || approvalDialog.riskLevel === 'medium') && (
                <div>
                  <Label>Justification {approvalDialog.riskLevel === 'high' && '*'}</Label>
                  <Textarea
                    placeholder="Explain why this permission should be approved..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialog(null)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={confirmApproval}
              disabled={approvalDialog?.riskLevel === 'high' && !justification.trim()}
            >
              Approve Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
