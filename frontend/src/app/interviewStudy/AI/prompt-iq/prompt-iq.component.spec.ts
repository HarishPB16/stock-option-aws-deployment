import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptIQComponent } from './prompt-iq.component';

describe('PromptIQComponent', () => {
  let component: PromptIQComponent;
  let fixture: ComponentFixture<PromptIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
