import { Component, OnInit } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgFor,
  NgIf,
} from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Beneficio, BeneficioService } from "../services/beneficio.service";

import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDividerModule } from "@angular/material/divider";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: "app-beneficios",
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    CurrencyPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSelectModule,
  ],
  templateUrl: "./beneficios.component.html",
  styleUrl: "./beneficios.component.css",
})
export class BeneficiosComponent implements OnInit {
  beneficios: Beneficio[] = [];
  loading = false;
  novoValorInput = "";
  transferenciaValorInput = "";

  editandoId: number | null = null;

  novo: Beneficio = {
    nome: "",
    descricao: "",
    valor: 0,
    ativo: true,
  };

  transferencia = {
    fromId: null as number | null,
    toId: null as number | null,
    amount: null as number | null,
  };

  constructor(
    private service: BeneficioService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get ativos(): number {
    return this.beneficios.filter((b) => b.ativo).length;
  }

  get inativos(): number {
    return this.beneficios.filter((b) => !b.ativo).length;
  }

  get valorTotal(): number {
    return this.beneficios.reduce(
      (acc, item) => acc + Number(item.valor || 0),
      0,
    );
  }

  load(): void {
    this.loading = true;
    this.service.list().subscribe({
      next: (data) => {
        this.beneficios = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open("Erro ao carregar benefícios.", "Fechar", {
          duration: 3000,
        });
      },
    });
  }

  salvar(): void {
    this.novo.nome = (this.novo.nome || "").trim();
    this.novo.descricao = (this.novo.descricao || "").trim();

    if (
      !this.novo.nome ||
      !this.novo.descricao ||
      !this.novo.valor ||
      this.novo.valor <= 0
    ) {
      this.snackBar.open("Preencha nome, descrição e valor válido.", "Fechar", {
        duration: 3000,
      });
      return;
    }

    if (this.novo.nome.length > 100) {
      this.snackBar.open(
        "O nome deve ter no máximo 100 caracteres.",
        "Fechar",
        {
          duration: 3000,
        },
      );
      return;
    }

    if (this.novo.descricao.length > 255) {
      this.snackBar.open(
        "A descrição deve ter no máximo 255 caracteres.",
        "Fechar",
        {
          duration: 3000,
        },
      );
      return;
    }

    this.novo.valor = Number(this.novo.valor.toFixed(2));
    this.loading = true;

    const request$ = this.editandoId
      ? this.service.update(this.editandoId, this.novo)
      : this.service.create(this.novo);

    request$.subscribe({
      next: () => {
        const mensagem = this.editandoId
          ? "Benefício atualizado com sucesso."
          : "Benefício criado com sucesso.";

        this.cancelarEdicao();

        this.snackBar.open(mensagem, "OK", {
          duration: 2500,
        });

        this.load();
      },
      error: (err) => {
        this.loading = false;

        const mensagem =
          err?.error?.message ||
          err?.error?.error ||
          (this.editandoId
            ? "Erro ao atualizar benefício."
            : "Erro ao criar benefício.");

        this.snackBar.open(mensagem, "Fechar", {
          duration: 3000,
        });
      },
    });
  }

  transferir(): void {
    const { fromId, toId, amount } = this.transferencia;

    if (!fromId || !toId || !amount || amount <= 0) {
      this.snackBar.open("Informe origem, destino e valor válido.", "Fechar", {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    this.service
      .transfer({
        fromId,
        toId,
        amount,
      })
      .subscribe({
        next: () => {
          this.transferencia = {
            fromId: null,
            toId: null,
            amount: null,
          };

          this.snackBar.open("Transferência realizada com sucesso.", "OK", {
            duration: 2500,
          });
          this.load();
        },
        error: (err) => {
          this.loading = false;
          const mensagem =
            err?.error?.message ||
            err?.error?.error ||
            "Erro ao transferir valor.";

          this.snackBar.open(mensagem, "Fechar", {
            duration: 3000,
          });
        },
      });
  }

  onValorChange(value: string): void {
    const digits = (value || "").replace(/\D/g, "").slice(0, 15);

    if (!digits) {
      this.novoValorInput = "";
      this.novo.valor = 0;
      return;
    }

    const numericValue = Number(digits) / 100;
    this.novo.valor = numericValue;
    this.novoValorInput = this.formatarMoeda(numericValue);
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onValorInput(value: string): void {
    let v = (value || "").replace(/[^\d,]/g, "");

    const partes = v.split(",");

    let inteiro = partes[0] || "";
    let decimal = partes[1] || "";

    inteiro = inteiro.replace(/^0+(?=\d)/, "");
    inteiro = inteiro.slice(0, 13);
    decimal = decimal.slice(0, 2);

    this.novoValorInput = decimal !== "" ? `${inteiro},${decimal}` : inteiro;

    const valorNormalizado = this.novoValorInput.replace(",", ".");
    this.novo.valor = valorNormalizado ? Number(valorNormalizado) : 0;
  }

  onValorBlur(): void {
    if (!this.novoValorInput) {
      this.novo.valor = 0;
      return;
    }

    const valor = Number(this.novoValorInput.replace(",", "."));

    if (Number.isNaN(valor) || valor <= 0) {
      this.novoValorInput = "";
      this.novo.valor = 0;
      return;
    }

    this.novo.valor = Number(valor.toFixed(2));
    this.novoValorInput = this.novo.valor.toFixed(2).replace(".", ",");
  }

  editar(b: Beneficio): void {
    this.editandoId = b.id ?? null;
    this.novo = {
      id: b.id,
      nome: b.nome,
      descricao: b.descricao,
      valor: b.valor,
      ativo: b.ativo,
    };
    this.novoValorInput = Number(b.valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.novo = {
      nome: "",
      descricao: "",
      valor: 0,
      ativo: true,
    };
    this.novoValorInput = "";
  }

  excluir(id?: number): void {
    if (!id) {
      return;
    }

    this.loading = true;

    this.service.delete(id).subscribe({
      next: () => {
        if (this.editandoId === id) {
          this.cancelarEdicao();
        }

        this.snackBar.open("Benefício inativado com sucesso.", "OK", {
          duration: 2500,
        });

        this.load();
      },
      error: (err) => {
        this.loading = false;

        const mensagem =
          err?.error?.message ||
          err?.error?.error ||
          "Erro ao inativar benefício.";

        this.snackBar.open(mensagem, "Fechar", {
          duration: 3000,
        });
      },
    });
  }

  onFromChange(selectedId: number | null): void {
    if (selectedId && selectedId === this.transferencia.toId) {
      this.transferencia.toId = null;
    }
  }

  onToChange(selectedId: number | null): void {
    if (selectedId && selectedId === this.transferencia.fromId) {
      this.transferencia.fromId = null;
    }
  }

  onTransferenciaValorChange(value: string): void {
    const digits = (value || "").replace(/\D/g, "").slice(0, 15);

    if (!digits) {
      this.transferenciaValorInput = "";
      this.transferencia.amount = null;
      return;
    }

    const numericValue = Number(digits) / 100;
    this.transferencia.amount = numericValue;
    this.transferenciaValorInput = this.formatarMoeda(numericValue);
  }
}
